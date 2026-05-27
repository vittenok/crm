import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());

  console.log("Tilda webhook:", rawData);

  return NextResponse.json({ ok: true, data: rawData });
}