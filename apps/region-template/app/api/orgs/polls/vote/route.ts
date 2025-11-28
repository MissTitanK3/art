import { NextResponse } from "next/server";

import {
  createSupabaseRegionServiceClient,
  createSupabaseServerClient,
} from "@/lib/auth/supabase/server";
import { jsonError } from "@/lib/api/responses";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
import { getProfileByUserId } from "@/lib/dal/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pollId, optionId } = body ?? {};
    if (!pollId || !optionId) {
      return NextResponse.json(
        { message: "pollId and optionId are required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseRegionServiceClient();
    const server = await createSupabaseServerClient();

    const { data: poll, error: pollError } = await supabase
      .from("organization_polls")
      .select("id, org_id, status, closes_at, allow_multiple, organization:organizations(region_id)")
      .eq("id", pollId)
      .maybeSingle();
    if (pollError) throw pollError;
    const org = poll ? (Array.isArray(poll.organization) ? poll.organization[0] : poll.organization) : null;
    if (!poll || org?.region_id !== REGION_IDENTIFIER) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    const isClosed =
      poll.status === "closed" ||
      poll.status === "archived" ||
      (poll.closes_at && new Date(poll.closes_at).getTime() < Date.now());
    if (isClosed) {
      return NextResponse.json({ message: "Poll is closed" }, { status: 400 });
    }

    const { data: optionRow, error: optionError } = await supabase
      .from("organization_poll_options")
      .select("id, poll_id")
      .eq("id", optionId)
      .eq("poll_id", pollId)
      .maybeSingle();
    if (optionError) throw optionError;
    if (!optionRow) {
      return NextResponse.json({ message: "Option not found" }, { status: 404 });
    }

    const { data: userData } = await server.auth.getUser();
    const profile = userData.user ? await getProfileByUserId(userData.user.id) : null;
    const profileId = profile?.id ?? userData.user?.id ?? null;

    if (profileId && !poll.allow_multiple) {
      // Remove existing vote for this profile to allow changing choice
      const { error: deleteError } = await supabase
        .from("organization_poll_votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("profile_id", profileId);
      if (deleteError) throw deleteError;
    }

    // Insert vote
    const { error: voteError } = await supabase.from("organization_poll_votes").insert({
      poll_id: pollId,
      option_id: optionId,
      profile_id: profileId,
    });
    if (voteError) throw voteError;

    // Recalculate vote count for the option (service role, so safe)
    const { count, error: countError } = await supabase
      .from("organization_poll_votes")
      .select("id", { count: "exact", head: true })
      .eq("option_id", optionId);
    if (countError) throw countError;

    const { error: updateError } = await supabase
      .from("organization_poll_options")
      .update({ votes_count: count ?? 0 })
      .eq("id", optionId);
    if (updateError) throw updateError;

    return NextResponse.json({ pollId, optionId });
  } catch (e) {
    return jsonError(e);
  }
}
