import type { FootballOccurrence, FootballSeries } from "@/types/football";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export interface BuildFootballInvitationMessageInput {
  series: FootballSeries;
  occurrence: FootballOccurrence;
  location: string;
  playingCount: number;
  maxPlayers: number;
  url: string;
}

export function buildFootballInvitationMessage({
  series,
  occurrence,
  location,
  playingCount,
  maxPlayers,
  url,
}: BuildFootballInvitationMessageInput): string {
  const missing = Math.max(0, maxPlayers - playingCount);
  const statusLine = missing > 0 ? `Brakuje: ${missing}` : "Komplet";

  return `⚽ Piłka: ${series.title}
${DATE_TIME_FORMATTER.format(new Date(occurrence.starts_at))}
Miejsce: ${location}

Grają: ${playingCount}/${maxPlayers}
${statusLine}

Wpisz się tutaj:
${url}`;
}

export interface BuildFootballRegularReminderMessageInput {
  title: string;
  undecidedRegularNicknames: string[];
  url: string;
}

export function buildFootballRegularReminderMessage({
  title,
  undecidedRegularNicknames,
  url,
}: BuildFootballRegularReminderMessageInput): string {
  const lines = undecidedRegularNicknames.map((nickname) => `- ${nickname}`).join("\n");
  const undecidedBlock = lines || "-";

  return `⚽ Przypominajka: ${title}

Nie określili się jeszcze:
${undecidedBlock}

Wpiszcie się tutaj:
${url}`;
}
