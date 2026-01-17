"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MatchDetailHeader, MatchPlayersTable } from "@/components/match";
import { useMatch } from "@/hooks/use-matches";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ChevronLeft className="size-4" />
            Back to Matches
          </Link>
        </Button>
        <MatchDetailHeader match={match} />
        <Separator className="my-6" />
        <div className="space-y-6">
          <MatchPlayersTable players={match.players} team="Red" />
          <MatchPlayersTable players={match.players} team="Blue" />
        </div>
      </div>
    </div>
  );
}
