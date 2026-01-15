"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { MatchHeader, MatchPlayersTable } from "@/components/matches";
import { useMatch } from "@/hooks/use-matches";
import { Separator } from "@/components/ui/separator";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = use(params);
  const { match, loading, error } = useMatch(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (error || !match) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Match Details" backHref="/" />
      <MatchHeader match={match} />
      <Separator />
      <div className="space-y-6">
        <MatchPlayersTable players={match.players} team="Red" />
        <MatchPlayersTable players={match.players} team="Blue" />
      </div>
    </div>
  );
}
