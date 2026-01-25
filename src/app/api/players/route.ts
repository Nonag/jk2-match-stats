import { NextResponse } from "next/server";
import {
  getAllPlayers,
  createPlayer,
  getPlayersAndUnassignedMatchPlayers,
  getAllMatchPlayersForSuggestions,
  updatePlayerPrimaryName,
  deletePlayer,
} from "@/lib/db/player";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "combined") {
      const items = await getPlayersAndUnassignedMatchPlayers();
      return NextResponse.json(items);
    }

    if (view === "suggestions") {
      const suggestions = await getAllMatchPlayersForSuggestions();
      return NextResponse.json(suggestions);
    }

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

export async function PATCH(request: Request) {
  try {
    const { id, primaryName } = await request.json();

    if (!id || !primaryName || typeof primaryName !== "string") {
      return NextResponse.json(
        { error: "id and primaryName are required" },
        { status: 400 }
      );
    }

    await updatePlayerPrimaryName(id, primaryName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await deletePlayer(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { error: "Failed to delete player" },
      { status: 500 }
    );
  }
}
