import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  const expected = process.env.ADMIN_PIN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "PIN admin belum diatur di server." },
      { status: 500 }
    );
  }

  if (pin && pin === expected) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "PIN admin salah." },
    { status: 401 }
  );
}
