import type { PadelGathering, PadelOption } from "@/types/padel";

function formatOptionDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatOptionLine(index: number, o: PadelOption): string {
  let line = `${index}. ${o.venue_name} — ${formatOptionDateTime(o.starts_at)}`;
  const extras: string[] = [];
  if (o.duration_minutes != null) extras.push(`${o.duration_minutes} min`);
  const price = o.price_per_person?.trim();
  if (price) extras.push(`${price}/os`);
  if (extras.length > 0) line += `, ${extras.join(", ")}`;
  return line;
}

export interface BuildPadelInvitationMessageInput {
  gathering: PadelGathering;
  /** Chronological options (e.g. from getPadelOptions). */
  options: PadelOption[];
  url: string;
}

export function buildPadelInvitationMessage({
  gathering,
  options,
  url,
}: BuildPadelInvitationMessageInput): string {
  const lines = options.map((o, i) => formatOptionLine(i + 1, o));
  const warianty = lines.length > 0 ? lines.join("\n") : "—";

  return `🎾 Padel: ${gathering.title}

Warianty:
${warianty}

Zaznacz, które terminy Ci pasują:
${url}`;
}
