"use client";

import { PlayerTable } from "@/components/player";
import { usePlayers } from "@/hooks/use-players";

export default function PlayersPage() {
  const { players, loading } = usePlayers();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Players</h2>
          <p className="text-sm text-muted-foreground">
            Manage player identities and aliases
          </p>
        </div>
        <PlayerTable players={players} loading={loading} />
      </div>
    </div>
  );
}
