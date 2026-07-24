import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await prisma.user.updateMany({
      where: { name: { contains: 'ar' } },
      data: { role: 'ADMIN' }
    });
    return NextResponse.json({ success: true, updated: result.count, message: "User 'ar' has been promoted to ADMIN. Please delete this file now." });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
