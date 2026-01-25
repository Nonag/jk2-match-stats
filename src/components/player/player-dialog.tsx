"use client";

import { useMemo, useState } from "react";
import { Check, Merge, Plus, User, UserPlus, Users } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import {
  useAssignMatchPlayers,
  useCreatePlayer,
  useDeletePlayer,
  useMergePlayers,
  usePlayersAndMatchPlayers,
  useRenamePlayer,
} from "@/lib/queries";
import { sortBySimilarity } from "@/lib/utils";
import type { PlayerListItem } from "@/lib/db/player";

type DialogMode = "assign" | "create" | "merge" | "rename" | "view";

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
  const [mode, setMode] = useState<DialogMode>("view");
  const [newName, setNewName] = useState(item.aliasPrimary);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { items: allItems } = usePlayersAndMatchPlayers();
  const { createPlayer, loading: createLoading } = useCreatePlayer();
  const { renamePlayer, loading: renameLoading } = useRenamePlayer();
  const { deletePlayer, loading: deleteLoading } = useDeletePlayer();
  const { assignMatchPlayers, loading: assignLoading } = useAssignMatchPlayers();
  const { mergePlayers, loading: mergeLoading } = useMergePlayers();

  const isLoading = createLoading || renameLoading || deleteLoading || assignLoading || mergeLoading;

  // Get players sorted by similarity for assignment/merge
  const sortedPlayers = useMemo(() => {
    if (!item) return [];
    const players = allItems.filter((i) => i.type === "player" && i.id !== item.id);
    return sortBySimilarity(players, item.nameClean, (p) => p.aliasPrimary);
  }, [allItems, item]);

  // Get all items (players + matchplayers) sorted by similarity for merge
  const sortedAllItems = useMemo(() => {
    if (!item) return [];
    const others = allItems.filter((i) => i.id !== item.id);
    const filtered = searchQuery
      ? others.filter((i) =>
          i.aliasPrimary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.nameClean.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : others;
    return sortBySimilarity(filtered, item.nameClean, (i) => i.aliasPrimary);
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

  const handleRename = async () => {
    if (!item || !newName.trim() || item.type !== "player") return;
    await renamePlayer(item.id, newName.trim());
    onClose();
  };

  const handleDelete = async () => {
    if (!item || item.type !== "player") return;
    await deletePlayer(item.id);
    onClose();
  };

  const handleMerge = async () => {
    if (!item || item.type !== "player" || selectedMergeIds.length === 0) return;
    await mergePlayers(item.id, selectedMergeIds);
    onClose();
  };

  const toggleMergeSelection = (id: string) => {
    setSelectedMergeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isMatchPlayer = item.type === "matchplayer";

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {isMatchPlayer ? (
            <Badge className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" variant="outline">
              Unassigned
            </Badge>
          ) : (
            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" variant="outline">
              Player
            </Badge>
          )}
          {item.aliasPrimary}
        </DialogTitle>
        <DialogDescription>
          {isMatchPlayer
            ? "This name hasn't been assigned to a player yet"
            : `${item.matchCount} matches · ${item.aliases.length} aliases`}
        </DialogDescription>
      </DialogHeader>

      {mode === "view" && (
        <>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{item.capturesSum}</div>
              <div className="text-muted-foreground text-sm">Captures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{item.returnsSum}</div>
              <div className="text-muted-foreground text-sm">Returns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{item.bcSum}</div>
              <div className="text-muted-foreground text-sm">Base Cleans</div>
            </div>
          </div>

          {!isMatchPlayer && item.aliases.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-sm text-muted-foreground">Aliases</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.aliases.map((alias) => (
                    <Badge key={alias.id} variant="secondary">
                      {alias.nameClean}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-wrap gap-2">
            {isMatchPlayer ? (
              <>
                <Button onClick={() => setMode("create")} variant="default">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Player
                </Button>
                <Button onClick={() => setMode("assign")} variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Assign to Player
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setMode("rename")} variant="outline">
                  Rename
                </Button>
                <Button onClick={() => setMode("merge")} variant="outline">
                  <Merge className="mr-2 h-4 w-4" />
                  Merge
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {mode === "create" && (
        <>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter player name"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will create a new player and assign all &quot;{item.nameClean}&quot;
              match records ({item.matchCount} matches) to it.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode("view")}>
              Cancel
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
      )}

      {mode === "assign" && (
        <>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a player to assign all &quot;{item.nameClean}&quot; match records to:
            </p>
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-2 space-y-1">
                {sortedPlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    No players found. Create a new player first.
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
                      <div>
                        <div className="font-medium">{player.aliasPrimary}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.matchCount} matches
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode("view")}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignToExisting}
              disabled={!selectedPlayerId || isLoading}
            >
              Assign to Player
            </Button>
          </DialogFooter>
        </>
      )}

      {mode === "rename" && (
        <>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">New Name</Label>
              <Input
                id="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode("view")}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newName.trim() || newName === item.aliasPrimary || isLoading}
            >
              Rename
            </Button>
          </DialogFooter>
        </>
      )}

      {mode === "merge" && (
        <>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select players or unassigned names to merge into &quot;{item.aliasPrimary}&quot;.
              All their match records will be transferred.
            </p>
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-2 space-y-1">
                {sortedAllItems.map((other) => (
                  <button
                    key={other.id}
                    onClick={() => toggleMergeSelection(other.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent ${
                      selectedMergeIds.includes(other.id) ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {other.type === "matchplayer" ? (
                        <Badge className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400 text-xs" variant="outline">
                          Unassigned
                        </Badge>
                      ) : (
                        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 text-xs" variant="outline">
                          Player
                        </Badge>
                      )}
                      <div>
                        <div className="font-medium">{other.aliasPrimary}</div>
                        <div className="text-sm text-muted-foreground">
                          {other.matchCount} matches
                        </div>
                      </div>
                    </div>
                    {selectedMergeIds.includes(other.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
            {selectedMergeIds.length > 0 && (
              <p className="text-sm">
                <Users className="inline h-4 w-4 mr-1" />
                {selectedMergeIds.length} selected to merge
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMode("view")}>
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={selectedMergeIds.length === 0 || isLoading}
            >
              <Merge className="mr-2 h-4 w-4" />
              Merge Selected
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
}
