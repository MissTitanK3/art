import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api/responses';
import { getAuthenticatedProfile } from '@/lib/api/dispatches/utils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const { data, error } = await supabase
      .from('dispatch_updates')
      .select('*')
      .eq('dispatch_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const updates = (data ?? []).map((row: any) => ({
      id: row.id,
      author: row.author,
      text: row.text ?? '',
      createdAt: row.created_at ?? row.createdAt,
      attachments: row.attachments ?? [],
    }));
    return NextResponse.json({ updates });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { supabase } = await getAuthenticatedProfile();
    const update = await req.json();
    const { createdAt, ...rest } = update ?? {};
    const payload = {
      ...rest,
      dispatch_id: id,
      ...(createdAt ? { created_at: createdAt } : {}),
    };
    const { error } = await supabase.from('dispatch_updates').insert(payload);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
