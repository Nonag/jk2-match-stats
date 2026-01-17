import { NextResponse } from "next/server";
import { getAllPlayers, createPlayer } from "@/lib/db/player";

export async function GET() {
  try {
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { primaryName } = await request.json();

    if (!primaryName || typeof primaryName !== "string") {
      return NextResponse.json(
        { error: "Primary name is required" },
        { status: 400 }
      );
    }

    const player = await createPlayer(primaryName);
    return NextResponse.json(player);
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
