"use client";

import { PageHeader } from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlayers } from "@/hooks/use-players";

export default function PlayersPage() {
  const { players, loading } = usePlayers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="Manage player identities and aliases"
      />
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading players...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            No players found. Import match data to see players.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Primary Name</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead className="text-right">Matches</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {player.primaryName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {player.aliases.map((alias) => (
                        <Badge key={alias.id} variant="secondary">
                          {alias.nameClean}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {player.matchCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
