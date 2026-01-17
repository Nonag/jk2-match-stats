import { NextRequest, NextResponse } from "next/server";
import { linkMatchPlayerToPlayer, unlinkMatchPlayerFromPlayer } from "@/lib/db/player";

export async function POST(request: NextRequest) {
  try {
    const { matchPlayerId, playerId } = await request.json();

    if (!matchPlayerId || !playerId) {
      return NextResponse.json(
        { error: "matchPlayerId and playerId are required" },
        { status: 400 }
      );
    }

    await linkMatchPlayerToPlayer(matchPlayerId, playerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error linking player:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to link player" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { matchPlayerId } = await request.json();

    if (!matchPlayerId) {
      return NextResponse.json(
        { error: "matchPlayerId is required" },
        { status: 400 }
      );
    }

    await unlinkMatchPlayerFromPlayer(matchPlayerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking player:", error);
    return NextResponse.json(
      { error: "Failed to unlink player" },
      { status: 500 }
    );
  }
}
