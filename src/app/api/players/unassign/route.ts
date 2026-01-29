import { NextResponse } from "next/server";
import { unlinkMatchPlayerFromPlayer } from "@/lib/db/player";

export async function POST(request: Request) {
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
    console.error("Error unassigning player:", error);
    return NextResponse.json(
      { error: "Failed to unlink player" },
      { status: 500 }
    );
  }
}
