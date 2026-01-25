import { NextResponse } from "next/server";
import {
  getAllPlayers,
  createPlayer,
  getPlayersAndUnassignedMatchPlayers,
  getAllMatchPlayersForSuggestions,
  updatePlayerAlias,
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
    const { aliasPrimary } = await request.json();

    if (!aliasPrimary || typeof aliasPrimary !== "string") {
      return NextResponse.json(
        { error: "Primary alias is required" },
        { status: 400 }
      );
    }

    const player = await createPlayer(aliasPrimary);
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
    const { id, aliasPrimary } = await request.json();

    if (!id || !aliasPrimary || typeof aliasPrimary !== "string") {
      return NextResponse.json(
        { error: "id and aliasPrimary are required" },
        { status: 400 }
      );
    }

    await updatePlayerAlias(id, aliasPrimary);
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
