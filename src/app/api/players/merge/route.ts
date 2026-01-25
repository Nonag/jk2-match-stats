import { NextResponse } from "next/server";
import { mergePlayers } from "@/lib/db/player";

export async function POST(request: Request) {
  try {
    const { targetPlayerId, sourcePlayerIds } = await request.json();

    if (!targetPlayerId || !Array.isArray(sourcePlayerIds) || sourcePlayerIds.length === 0) {
      return NextResponse.json(
        { error: "Target player ID and source player IDs are required" },
        { status: 400 }
      );
    }

    await mergePlayers(targetPlayerId, sourcePlayerIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error merging players:", error);
    return NextResponse.json(
      { error: "Failed to merge players" },
      { status: 500 }
    );
  }
}
