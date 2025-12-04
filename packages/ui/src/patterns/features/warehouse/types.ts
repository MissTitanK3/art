import { z } from "zod";
import { VisibilityScope } from "@workspace/store/utils/permissions/types";

export const capabilityOptions = [
    { value: "refrigeration", label: "Refrigeration" },
    { value: "power", label: "Power" },
    { value: "staging", label: "Staging space" },
    { value: "accessible", label: "Accessible entry" },
    { value: "covered", label: "Covered load-out" },
    { value: "secure_storage", label: "Lockable storage" },
];

export const regionZoneOptions = ["North", "Central", "South", "Coast", "Inland"];

export const siteTypeOptions = [
    { value: "home", label: "Home / host" },
    { value: "pod", label: "Pod stash" },
    { value: "storage", label: "Storage unit" },
    { value: "temporary", label: "Temporary site" },
];

export const capacityOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xl", label: "XL" },
];

export const urbanTypes = [
    { value: "urban", label: "Urban" },
    { value: "rural", label: "Rural" },
    { value: "mixed", label: "Mixed" },
];

export const MAX_ZONES = 5;

export const inventoryConditions = [
    { value: "sealed", label: "Sealed" },
    { value: "open-safe", label: "Open safe" },
    { value: "used", label: "Used" },
    { value: "unsafe", label: "Unsafe hold" },
] as const;

export type CatalogItem = {
    sku: string;
    itemName: string;
    category: string;
};

export const binSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "Label required").max(60, "Keep it under 60 chars"),
    sortOrder: z
        .number({ invalid_type_error: "Use a whole number" })
        .int()
        .min(1)
        .max(50)
        .optional()
        .nullable(),
});

export const zoneSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Zone name required").max(60),
    sortOrder: z
        .number({ invalid_type_error: "Use a whole number" })
        .int()
        .min(1)
        .max(20)
        .optional()
        .nullable(),
    bins: z
        .array(binSchema)
        .min(1, "Add at least one bin so pick lists are actionable")
        .max(12, "Keep bins manageable"),
});

export const warehouseFormSchema = z.object({
    stewardDisplayName: z
        .string()
        .min(2, "Steward display name is required")
        .max(80, "Keep it under 80 characters"),
    regionZone: z.string().min(1, "Select a region zone"),
    urbanType: z.enum(["urban", "rural", "mixed"]),
    siteType: z.enum(["home", "pod", "storage", "temporary"]),
    maxCapacityRating: z.enum(["small", "medium", "large", "xl"]),
    capabilities: z.array(z.string()).max(8, "Keep the capability list focused"),
    quickNotes: z
        .string()
        .max(220, "Keep notes concise")
        .optional()
        .or(z.literal("")),
    zones: z
        .array(zoneSchema)
        .min(1, "Create at least one zone")
        .max(MAX_ZONES, "Only track up to five zones"),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export type WarehouseRecord = WarehouseFormValues & {
    id: string;
    regionId: string;
    createdAt: string;
    displayName?: string;
    visibilityScope?: VisibilityScope;
    invitedUserIds?: string[];
};

export type InventoryEntry = {
    id: string;
    warehouseId: string;
    zoneId: string;
    binId: string;
    itemName: string;
    sku: string;
    category: string;
    condition: (typeof inventoryConditions)[number]["value"];
    quantity: number;
    expirationDate?: string | null;
    updatedAt: string;
};

export type MovementLogEntry = {
    id: string;
    warehouseId: string;
    warehouseName: string;
    type: "intake" | "outflow" | "cycle";
    sku: string;
    itemName: string;
    quantity: number;
    byDisplayName: string;
    createdAt: string;
    notes?: string;
    locationLabel?: string;
    zoneId?: string;
    binId?: string;
};

export type PickListItem = {
    id: string;
    inventoryId: string;
    warehouseId: string;
    zoneId?: string;
    binId?: string;
    itemName: string;
    sku: string;
    quantity: number;
    confirmed?: boolean;
    confirmedAt?: string;
    confirmedBy?: string;
    confirmedByDisplayName?: string;
};

export const inventoryIntakeSchema = z.object({
    warehouseId: z.string().min(1, "Select a warehouse"),
    zoneId: z.string().min(1, "Select a zone"),
    binId: z.string().min(1, "Select a bin"),
    sku: z.string().min(2, "Provide a SKU or shorthand"),
    itemName: z.string().min(2, "Item name required"),
    category: z.string().min(2, "Category required"),
    quantity: z
        .number({ invalid_type_error: "Quantity required" })
        .int()
        .positive("Must be at least 1"),
    condition: z.enum(
        inventoryConditions.map((condition) => condition.value) as [
            (typeof inventoryConditions)[number]["value"],
            ...((typeof inventoryConditions)[number]["value"])[],
        ],
    ),
    expirationDate: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((value) => (value ? value : undefined)),
    notes: z
        .string()
        .max(180, "Keep notes lightweight")
        .optional()
        .or(z.literal("")),
});

export type InventoryIntakeValues = z.infer<typeof inventoryIntakeSchema>;

export type InventorySubmission = {
    warehouseId: string;
    zoneId: string;
    binId: string;
    itemName: string;
    sku: string;
    category: string;
    condition: (typeof inventoryConditions)[number]["value"];
    quantity: number;
    expirationDate: string | null;
};

export type OfflineWarehouseState = {
    warehouses: WarehouseRecord[];
    inventory: InventoryEntry[];
    movementLogs: MovementLogEntry[];
    pickList: PickListItem[];
};

export function resolveInventoryLocation(
    entry: { warehouseId: string; zoneId: string; binId: string },
    warehouses: WarehouseRecord[],
) {
    const warehouse = warehouses.find((candidate) => candidate.id === entry.warehouseId);
    const zone = warehouse?.zones.find((candidate) => candidate.id === entry.zoneId);
    const bin = zone?.bins.find((candidate) => candidate.id === entry.binId);
    return {
        warehouseName:
            warehouse?.stewardDisplayName ?? warehouse?.displayName ?? "Unassigned",
        zoneName: zone?.name,
        binName: bin?.label,
    };
}
