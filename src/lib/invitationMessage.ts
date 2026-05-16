import type { EventRow } from "@/types/event";

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatInvitationDateTime(startsAt: string): string {
  const date = new Date(startsAt);
  const time = date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isSameDay(date, now)) return `dziś ${time}`;
  if (isSameDay(date, tomorrow)) return `jutro ${time}`;

  const weekday = date.toLocaleDateString("pl-PL", { weekday: "long" });
  return `${weekday} ${time}`;
}

interface BuildInvitationMessageInput {
  event: EventRow;
  modeLabel: string;
  playingCount: number;
  spotsLeftCount: number;
  url: string;
}

export function buildInvitationMessage({
  event,
  modeLabel,
  playingCount,
  spotsLeftCount,
  url,
}: BuildInvitationMessageInput): string {
  const when = formatInvitationDateTime(event.starts_at);
  const lines = [
    `🎮 ${event.title} — ${modeLabel} ${when}`,
    "",
    "Zapisz się:",
    url,
    "",
    `Grają: ${playingCount}/${event.max_players}`,
    `Brakuje: ${spotsLeftCount}`,
  ];

  if (event.discord_info?.trim()) {
    lines.push("", `Discord: ${event.discord_info.trim()}`);
  }

  return lines.join("\n");
}
