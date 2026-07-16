import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const newRequest = await prisma.request.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        userId: parseInt(session.user.id),
        attachmentUrl: data.attachmentUrl || null,
        requiredByDate: data.requiredByDate ? new Date(data.requiredByDate) : null,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const meOnly = searchParams.get('me') === 'true';

    // Admins see all by default, unless they specifically request only their own
    const whereClause = (session.user.role === "ADMIN" && !meOnly) 
      ? {} 
      : { userId: parseInt(session.user.id) };

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
