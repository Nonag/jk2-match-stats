"use client";

import { PageHeader } from "@/components/layout";
import { PlayerTable } from "@/components/player";
import { usePlayers } from "@/hooks/use-players";

export default function PlayersPage() {
  const { players, loading } = usePlayers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="Manage player identities and aliases"
      />
      <PlayerTable players={players} loading={loading} />
    </div>
  );
}
