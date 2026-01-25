"use client";

import { PlayerTable } from "@/components/player";
import { usePlayersAndMatchPlayers } from "@/lib/queries";

export default function PlayersPage() {
  const { items, loading } = usePlayersAndMatchPlayers();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Players</h2>
          <p className="text-sm text-muted-foreground">
            Manage player identities and assign match names
          </p>
        </div>
        <PlayerTable items={items} loading={loading} />
      </div>
    </div>
  );
}
