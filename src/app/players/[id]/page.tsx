"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchPlayerTable } from "@/components/match";
import { usePlayer, useDeletePlayer } from "@/lib/queries";

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { player, loading } = usePlayer(id);
  const { deletePlayer, loading: deleteLoading } = useDeletePlayer();

  const handleDelete = async () => {
    if (!player) return;

    const confirmed = confirm(
      `Delete player "${player.aliasPrimary}"? This will unassign ${player.matchPlayers.length} match records but won't delete them.`
    );

    if (!confirmed) return;

    const success = await deletePlayer(player.id);
    if (success) {
      router.push("/players");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <p className="text-muted-foreground">Loading player...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <p className="text-muted-foreground">Player not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{player.aliasPrimary}</h2>
              <p className="text-sm text-muted-foreground">
                {player.matchCount} matches · {player.aliases.length} aliases
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              <Trash2 />
              Delete Player
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Aliases</h3>
            <div className="flex flex-wrap gap-2">
              {player.aliases.map((alias) => (
                <div
                  key={alias.id}
                  className="px-3 py-1 bg-muted rounded-md text-sm"
                >
                  {alias.nameClean}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Assigned Match Players ({player.matchPlayers.length})</h3>
            {player.matchPlayers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No match players assigned yet
              </p>
            ) : (
              <MatchPlayerTable
                players={player.matchPlayers}
                minimal
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
