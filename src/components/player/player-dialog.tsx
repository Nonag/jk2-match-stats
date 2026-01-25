"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Plus, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAssignMatchPlayers,
  useCreatePlayer,
  usePlayersAndMatchPlayers,
} from "@/lib/queries";
import { sortBySimilarity } from "@/lib/utils";
import type { PlayerListItem } from "@/lib/db/player";

interface PlayerDialogProps {
  item: PlayerListItem | null;
  onClose: () => void;
  open: boolean;
}

export function PlayerDialog({ item, onClose, open }: PlayerDialogProps) {
  // Key forces remount when item changes, resetting all state
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {item && <PlayerDialogContent key={item.id} item={item} onClose={onClose} />}
    </Dialog>
  );
}

function PlayerDialogContent({ item, onClose }: { item: PlayerListItem; onClose: () => void }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState(item.aliasPrimary);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { items: allItems } = usePlayersAndMatchPlayers();
  const { createPlayer, loading: createLoading } = useCreatePlayer();
  const { assignMatchPlayers, loading: assignLoading } = useAssignMatchPlayers();

  const isLoading = createLoading || assignLoading;

  // Get players sorted by similarity for assignment
  const sortedPlayers = useMemo(() => {
    if (!item) return [];
    const players = allItems.filter((i) => i.type === "player" && i.id !== item.id);
    const filtered = searchQuery
      ? players.filter((p) =>
          p.aliasPrimary.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : players;
    return sortBySimilarity(filtered, item.nameClean, (p) => p.aliasPrimary);
  }, [allItems, item, searchQuery]);

  const handleCreateAndAssign = async () => {
    if (!item || !newName.trim()) return;
    const result = await createPlayer(newName.trim());
    if (result) {
      await assignMatchPlayers(item.nameClean, result.id);
      onClose();
    }
  };

  const handleAssignToExisting = async () => {
    if (!item || !selectedPlayerId) return;
    await assignMatchPlayers(item.nameClean, selectedPlayerId);
    onClose();
  };

  const isPlayer = item.type === "player";

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isPlayer ? (
            <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500/20" />
          ) : (
            <Badge className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" variant="outline">
              Unassigned
            </Badge>
          )}
          {item.aliasPrimary}
        </DialogTitle>
        <DialogDescription>
          {isPlayer
            ? "This is already a verified player"
            : `Assign "${item.nameClean}" to a player`}
        </DialogDescription>
      </DialogHeader>

      {isPlayer ? (
        <div className="py-4 text-center text-muted-foreground">
          <BadgeCheck className="h-12 w-12 mx-auto mb-2 text-blue-500 fill-blue-500/20" />
          <p>This name is already assigned to a verified player.</p>
          <p className="text-sm mt-1">{item.matchCount} matches · {item.aliases.length} aliases</p>
        </div>
      ) : showCreateForm ? (
        <>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter player name"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will create a new player and assign all &quot;{item.nameClean}&quot;
              match records ({item.matchCount} matches) to it.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Back
            </Button>
            <Button
              onClick={handleCreateAndAssign}
              disabled={!newName.trim() || isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create & Assign
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-2 space-y-1">
                {sortedPlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    {searchQuery ? "No players match your search" : "No players found. Create a new player."}
                  </p>
                ) : (
                  sortedPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent ${
                        selectedPlayerId === player.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                        <div>
                          <div className="font-medium">{player.aliasPrimary}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.matchCount} matches
                          </div>
                        </div>
                      </div>
                      {selectedPlayerId === player.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create New Player
            </Button>
            <Button
              onClick={handleAssignToExisting}
              disabled={!selectedPlayerId || isLoading}
              className="w-full sm:w-auto"
            >
              Assign to Selected
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}
