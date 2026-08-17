export function getLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNowInTimezone(
  timeZone = "Asia/Jakarta"
): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );

  let hour = parts.hour;
  if (hour === "24") hour = "00";

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(hour) * 60 + Number(parts.minute),
  };
}
