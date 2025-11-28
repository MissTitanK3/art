// Lightweight in-memory Supabase-like client for demo mode.
// This keeps API routes working without a real backend by storing rows in memory.

type TableStore = Record<string, any[]>;

const GLOBAL_DB_KEY = Symbol.for("art.demoSupabase.db");
const GLOBAL_USER_KEY = Symbol.for("art.demoSupabase.user");

const demoUser = {
  id: "demo-user",
  email: "demo@region.template",
  role: "dispatcher_admin",
  user_metadata: { role: "dispatcher_admin", full_name: "Demo Admin" },
};

function seedDb(): TableStore {
  const now = new Date().toISOString();
  return {
    dispatch_submissions: [
      {
        id: "demo-dispatch-1",
        type: "dispatch",
        location_label: "Downtown Demo Plaza",
        location: { lat: 47.6062, lng: -122.3321 },
        timestamp: now,
        date_of_event: now,
        status: "open",
        required_roles: ["scout"],
        updates: [],
        logistics: [],
        flagged: false,
        training: false,
      },
    ],
    pods: [
      {
        id: "demo-pod-1",
        slug: "demo-pod-1",
        name: "Demo Pod Alpha",
        area: "Central",
        channels: [],
      },
    ],
    profiles: [
      {
        id: "demo-profile-1",
        user_id: demoUser.id,
        display_name: "Demo Admin",
        access_role: "dispatcher_admin",
        verified_by: "admin",
        affiliation: "Demo Dispatch HQ",
        field_roles: ["dispatcher"],
        state: "active",
        availability: true,
        contact_signal: "@demo_admin.01",
        coordination_zone: "America/Los_Angeles",
        city: "Demo City",
        inserted_at: now,
        updated_at: now,
        coverage_zones: ["Central", "North"],
        weekly_availability: {
          blocks: {
            Monday: [
              { start: "09:00", end: "12:00" },
              { start: "13:00", end: "17:00" },
            ],
            Wednesday: [{ start: "10:00", end: "14:00" }],
            Friday: [{ start: "18:00", end: "22:00" }],
          },
        },
        self_risk_acknowledged: true,
        operating_counties: ["53033", "53061"],
        self_status_flags: ["demo", "dispatcher_admin"],
      },
    ],
    organizations: [
      {
        id: "demo-org-1",
        name: "Demo Organization",
        description: "Demo organization for template",
        slug: "demo-org",
        region_id: "region-template",
        norms: null,
        visibility_scope: "regional",
        created_at: now,
      },
    ],
    organization_pods: [
      { id: "demo-orgpod-1", org_id: "demo-org-1", pod_id: "demo-pod-1", created_at: now },
      { id: "demo-orgpod-2", org_id: "demo-org-1", pod_id: "demo-pod-2", created_at: now },
    ],
    missing_person_records: [
      {
        id: "demo-mpr-1",
        case_id: "MPR-001",
        full_name: "Demo Person",
        detention_location: "Demo Detention Center",
        detention_datetime: now,
        last_updated: now,
      },
    ],
  };
}

function getDb(): TableStore {
  const g = globalThis as any;
  if (!g[GLOBAL_DB_KEY]) {
    g[GLOBAL_DB_KEY] = seedDb();
  }
  return g[GLOBAL_DB_KEY] as TableStore;
}

function getAuthUser() {
  const g = globalThis as any;
  if (!g[GLOBAL_USER_KEY]) {
    g[GLOBAL_USER_KEY] = demoUser;
  }
  return g[GLOBAL_USER_KEY];
}

type FilterFn = (row: any) => boolean;

class QueryBuilder {
  private table: string;
  private db: TableStore;
  private filters: FilterFn[] = [];
  private sortField: string | null = null;
  private sortAsc = true;
  private rangeBounds: [number, number] | null = null;
  private mutation:
    | null
    | { type: "update"; values: any }
    | { type: "delete" }
    | { type: "upsert"; values: any | any[] } = null;
  private singleResult = false;
  private selectedColumns: string | null = null;

  constructor(table: string, db: TableStore) {
    this.table = table;
    this.db = db;
    if (!this.db[this.table]) this.db[this.table] = [];
  }

  private applyFilters(rows: any[]) {
    return rows.filter((row) => this.filters.every((fn) => fn(row)));
  }

  private applySort(rows: any[]) {
    if (!this.sortField) return rows;
    return [...rows].sort((a, b) => {
      const av = a?.[this.sortField as any];
      const bv = b?.[this.sortField as any];
      if (av === bv) return 0;
      if (av === undefined) return this.sortAsc ? -1 : 1;
      if (bv === undefined) return this.sortAsc ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") {
        return this.sortAsc ? av - bv : bv - av;
      }
      return this.sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }

  private applyRange(rows: any[]) {
    if (!this.rangeBounds) return rows;
    const [from, to] = this.rangeBounds;
    return rows.slice(from, to + 1);
  }

  private runMutation(rows: any[]): any[] {
    if (!this.mutation) return rows;
    if (this.mutation.type === "delete") {
      return rows.filter((row) => !this.filters.every((fn) => fn(row)));
    }
    if (this.mutation.type === "update") {
      const mutation = this.mutation; // TypeScript now knows this has .values
      return rows.map((row) =>
        this.filters.every((fn) => fn(row))
          ? { ...row, ...mutation.values }
          : row,
      );
    }
    if (this.mutation.type === "upsert") {
      const mutation = this.mutation; // TypeScript now knows this has .values
      const incoming = Array.isArray(mutation.values)
        ? mutation.values
        : [mutation.values];
      const next = rows.slice();
      for (const item of incoming) {
        const idx = next.findIndex((r) => r.id && item.id && r.id === item.id);
        if (idx >= 0) next[idx] = { ...next[idx], ...item };
        else next.push(item);
      }
      return next;
    }
    return rows;
  }

  eq(field: string, value: any) {
    this.filters.push((row) => row?.[field] === value);
    return this;
  }

  is(field: string, value: any) {
    this.filters.push((row) =>
      value === null ? row?.[field] == null : row?.[field] === value,
    );
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push((row) => row?.[field] >= value);
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push((row) => row?.[field] <= value);
    return this;
  }

  in(field: string, values: any[]) {
    const set = new Set(values ?? []);
    this.filters.push((row) => set.has(row?.[field]));
    return this;
  }

  or(expr: string) {
    // Parse OR expressions: supports field.eq.value and field.ilike.%term%
    const parts = expr.split(",");
    this.filters.push((row) =>
      parts.some((part) => {
        // Handle .in. pattern (field.in.(a,b,c))
        if (part.includes(".in.(") && part.endsWith(")")) {
          const [lhs, rhs] = part.split(".in.(");
          if (!lhs || !rhs) return false;
          const values = rhs.slice(0, -1).split(",");
          return values.includes(String(row?.[lhs]));
        }
        // Handle .eq. pattern
        if (part.includes(".eq.")) {
          const [field, value] = part.split(".eq.");
          if (!field || value === undefined) return false;
          return row?.[field] === value;
        }
        // Handle .ilike. pattern
        if (part.includes(".ilike.")) {
          const [lhs, rhs] = part.split(".ilike.");
          if (!lhs || !rhs) return false;
          const term = rhs.replace(/%/g, "").toLowerCase();
          const val = String(row?.[lhs] ?? "").toLowerCase();
          return val.includes(term);
        }
        return false;
      }),
    );
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.sortField = field;
    this.sortAsc = opts?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.rangeBounds = [0, count - 1];
    return this;
  }

  range(from: number, to: number) {
    this.rangeBounds = [from, to];
    return this;
  }

  update(values: any) {
    this.mutation = { type: "update", values };
    return this;
  }

  delete() {
    this.mutation = { type: "delete" };
    return this;
  }

  upsert(values: any | any[]) {
    this.mutation = { type: "upsert", values };
    return this;
  }

  select(columns: string | null = "*") {
    this.selectedColumns = columns;
    return this;
  }

  private async execute() {
    const rows = this.db[this.table] ?? [];
    const mutated = this.runMutation(rows);
    this.db[this.table] = mutated;
    let result = this.applyFilters(mutated);
    result = this.applySort(result);
    const totalCount = result.length;
    result = this.applyRange(result);
    const payload = this.singleResult ? result[0] ?? null : result;
    return { data: payload, error: null, count: totalCount };
  }

  // Promise-like so `await supabase.from(...).select(...).order(...)` works
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: any; error: any; count: number }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ) {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null) {
    return this.execute().finally(onfinally ?? undefined);
  }

  async single() {
    this.singleResult = true;
    return this.execute();
  }

  async maybeSingle() {
    this.singleResult = true;
    return this.execute();
  }

  insert(values: any) {
    const arr = Array.isArray(values) ? values : [values];
    const tableRows = this.db[this.table];
    if (!tableRows) {
      throw new Error(`Table ${this.table} does not exist`);
    }
    arr.forEach((val) => tableRows.push(val));
    const first = arr[0] ?? null;
    return {
      select: () => ({
        single: async () => ({ data: first, error: null }),
        maybeSingle: async () => ({ data: first, error: null }),
      }),
      single: async () => ({ data: first, error: null }),
      maybeSingle: async () => ({ data: first, error: null }),
      data: first,
      error: null,
    };
  }
}

export function isDemoMode() {
  return (
    process.env.NEXT_PUBLIC_AUTH_PROVIDER === "demo" ||
    (!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function createDemoSupabaseClient() {
  const db = getDb();
  return {
    auth: {
      async getUser() {
        return { data: { user: getAuthUser() }, error: null };
      },
      async getSession() {
        return {
          data: {
            session: {
              user: getAuthUser(),
              access_token: "demo-access-token",
              expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            },
          },
          error: null,
        };
      },
      onAuthStateChange(_callback: (event: string, session: any) => void) {
        // In demo mode, auth state never changes, so we just return a no-op subscription
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      async signInWithPassword(_credentials: {
        email: string;
        password: string;
      }) {
        // Always succeed in demo mode
        return {
          data: {
            user: getAuthUser(),
            session: {
              user: getAuthUser(),
              access_token: "demo-access-token",
              expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            },
          },
          error: null,
        };
      },
      async signInWithOtp(_payload: { email: string }) {
        // Always succeed in demo mode
        return { data: {}, error: null };
      },
      async signUp(_credentials: {
        email: string;
        password: string;
        options?: any;
      }) {
        // Always succeed in demo mode
        return {
          data: {
            user: getAuthUser(),
            session: {
              user: getAuthUser(),
              access_token: "demo-access-token",
              expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            },
          },
          error: null,
        };
      },
      async signOut() {
        // No-op in demo mode
        return { error: null };
      },
      async resetPasswordForEmail(_email: string, _options?: any) {
        // No-op in demo mode
        return { data: {}, error: null };
      },
      async updateUser(_attributes: { password?: string }) {
        // No-op in demo mode, but return updated user
        return {
          data: { user: getAuthUser() },
          error: null,
        };
      },
    },
    channel(_name: string) {
      const stub = {
        on() {
          return stub;
        },
        subscribe: async () => ({ data: { subscription: {} }, error: null }),
        unsubscribe: () => {},
      };
      return stub;
    },
    async removeChannel(channel: { unsubscribe?: () => void }) {
      try {
        channel?.unsubscribe?.();
      } catch {
        // best-effort cleanup; ignore demo errors
      }
      return { error: null };
    },
    from(table: string) {
      return new QueryBuilder(table, db);
    },
    rpc(_fn: string, _args?: any) {
      // No-op RPC for demo mode
      return Promise.resolve({ data: null, error: null });
    },
  } as any;
}
