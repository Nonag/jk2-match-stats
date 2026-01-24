import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db/match";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") ?? "7", 10);

    const stats = await getDashboardStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
