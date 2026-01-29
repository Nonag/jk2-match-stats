import { NextResponse } from "next/server";
import { getPlayerById } from "@/lib/db/player";
import prisma from "@/lib/db/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await getPlayerById(id);

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Get the player's matchPlayers
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { playerId: id, team: { in: ["Red", "Blue"] } },
      include: { match: { select: { date: true, mapName: true, id: true } } },
      orderBy: { match: { date: "desc" } },
    });

    return NextResponse.json({
      ...player,
      matchPlayers: matchPlayers.map((mp) => {
        const { match, ...rest } = mp;
        return {
          ...rest,
          matchDate: match.date,
          matchMapName: match.mapName,
          matchId: match.id,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}
