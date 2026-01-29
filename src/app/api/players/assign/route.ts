import { NextResponse } from "next/server";
import { assignMatchPlayerToPlayer } from "@/lib/db/player";

export async function POST(request: Request) {
  try {
    const { matchPlayerId, playerId } = await request.json();

    if (!matchPlayerId || !playerId) {
      return NextResponse.json(
        { error: "matchPlayerId and playerId are required" },
        { status: 400 }
      );
    }

    await assignMatchPlayerToPlayer(matchPlayerId, playerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning match player:", error);
    return NextResponse.json(
      { error: "Failed to assign match player" },
      { status: 500 }
    );
  }
}
