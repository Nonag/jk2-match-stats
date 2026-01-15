"use client";

import { PageHeader } from "@/components/layout";
import { PlayersTable } from "@/components/players";
import { usePlayers } from "@/hooks/use-players";

export default function PlayersPage() {
  const { players, loading } = usePlayers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="Manage player identities and aliases"
      />
      <PlayersTable players={players} loading={loading} />
    </div>
  );
}
