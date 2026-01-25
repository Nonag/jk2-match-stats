import { NextResponse } from "next/server";
import { assignMatchPlayersByNameClean } from "@/lib/db/player";

export async function POST(request: Request) {
  try {
    const { nameClean, playerId } = await request.json();

    if (!nameClean || !playerId) {
      return NextResponse.json(
        { error: "nameClean and playerId are required" },
        { status: 400 }
      );
    }

    await assignMatchPlayersByNameClean(nameClean, playerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning match players:", error);
    return NextResponse.json(
      { error: "Failed to assign match players" },
      { status: 500 }
    );
  }
}
