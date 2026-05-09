import type { User } from "@supabase/supabase-js";
import type { FootballSeries } from "@/types/football";

/** Organizer admin: logged-in owner (created_by) or legacy ?admin= token match. */
export function isFootballSeriesAdmin(
  series: FootballSeries,
  user: User | null,
  adminTokenFromUrl: string | null,
): boolean {
  if (adminTokenFromUrl && adminTokenFromUrl === series.admin_token) {
    return true;
  }
  if (user != null && series.created_by != null && user.id === series.created_by) {
    return true;
  }
  return false;
}
