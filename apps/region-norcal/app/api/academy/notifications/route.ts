import { NextResponse } from 'next/server';

import { jsonError } from '@/lib/api/responses';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';
import { notifyUsers, resolveRecipientsByRoles } from '@/lib/server/notify';

type SupportedEntity = 'class' | 'session';
type SupportedAction = 'create' | 'update';

type NotificationRequestBody = {
  id: string;
  type: SupportedEntity;
  action: SupportedAction;
  title?: string;
  link: string;
};

const TITLE_TEMPLATES: Record<SupportedEntity, Record<SupportedAction, string>> = {
  class: {
    create: 'New Academy Class Scheduled',
    update: 'Academy Class Updated',
  },
  session: {
    create: 'New Training Session Added',
    update: 'Training Session Updated',
  },
};

const MESSAGE_TEMPLATES: Record<SupportedEntity, Record<SupportedAction, (name: string) => string>> = {
  class: {
    create: (name: string) =>
      name ? `${name} is now available for scheduling.` : 'A new academy class has been added.',
    update: (name: string) =>
      name
        ? `${name} was updated. Review the latest details before attending.`
        : 'An academy class was updated. Review the latest details before attending.',
  },
  session: {
    create: (name: string) =>
      name ? `${name} is now on the training board.` : 'A new training session is now on the academy board.',
    update: (name: string) =>
      name
        ? `${name} was updated. Check the board for the latest timing and details.`
        : 'A training session was updated. Check the board for the latest timing and details.',
  },
};

const LEVEL_BY_ACTION: Record<SupportedAction, 'success' | 'info'> = {
  create: 'success',
  update: 'info',
};

const FALLBACK_LINK = '/academy';

function sanitizeLink(input: unknown): string {
  if (typeof input !== 'string') return FALLBACK_LINK;
  if (!input.startsWith('/')) return FALLBACK_LINK;
  return input;
}

function parseBody(raw: unknown): NotificationRequestBody {
  if (!raw || typeof raw !== 'object') {
    throw new Error('INVALID_BODY');
  }
  const body = raw as Record<string, unknown>;
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const type = body.type;
  const action = body.action;
  if (!id) throw new Error('INVALID_ID');
  if (type !== 'class' && type !== 'session') throw new Error('INVALID_TYPE');
  if (action !== 'create' && action !== 'update') throw new Error('INVALID_ACTION');
  const title = typeof body.title === 'string' ? body.title.trim() : undefined;
  const link = sanitizeLink(body.link);
  return { id, type, action, title, link };
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const raw = await req.json();
    let body: NotificationRequestBody;
    try {
      body = parseBody(raw);
    } catch {
      return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
    }
    const recipients = await resolveRecipientsByRoles({
      respectPrefs: true,
      channel: 'academy',
    });
    if (recipients.length === 0) {
      return NextResponse.json({ ok: true, recipients: 0 });
    }

    const title = TITLE_TEMPLATES[body.type][body.action];
    const messageTemplate = MESSAGE_TEMPLATES[body.type][body.action];
    const message = messageTemplate(body.title ?? '');
    const result = await notifyUsers({
      title,
      body: message,
      level: LEVEL_BY_ACTION[body.action],
      channel: 'academy',
      link: body.link,
      recipients,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 500 });
    }

    return NextResponse.json({ ok: true, recipients: recipients.length });
  } catch (err) {
    return jsonError(err);
  }
}
