import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: wizard, error } = await supabase
    .from('wizard')
    .select('*')
    .gte('timestamp', sevenDaysAgo)
    .order('timestamp', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize DB rows to client shape (location instead of report_location)
  const normalized = (wizard ?? []).map((row: any) => {
    const loc = row.report_location ?? row.location;
    return {
      ...row,
      location: loc,
    };
  });

  return NextResponse.json({ wizard: normalized });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const agency_type = JSON.parse(formData.get('agency_type') as string);
    const agency_other = formData.get('agency_other') as string;
    const location = JSON.parse(formData.get('location') as string);
    const media = formData.get('media') as File | null;

    const officer_moving = formData.get('officer_moving') === 'true';
    const officer_direction = formData.get('officer_direction') || null;
    const lights_on = formData.get('lights_on') === 'true';
    const sirens_on = formData.get('sirens_on') === 'true';

    let media_url: string | null = null;

    if (media && media.size > 0) {
      const fileExt = media.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, media, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json({ error: 'Media upload failed' }, { status: 500 });
      }

      const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(filePath);
      media_url = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from('wizard').insert([
      {
        agency_type,
        agency_other,
        report_location: location,
        media_url,
        officer_moving,
        officer_direction,
        lights_on,
        sirens_on,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
