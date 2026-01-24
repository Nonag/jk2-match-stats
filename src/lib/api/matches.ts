import type { MatchSummary, MatchDetail } from "@/lib/db/match";

export async function getMatches(): Promise<MatchSummary[]> {
  const response = await fetch("/api/matches");
  if (!response.ok) throw new Error("Failed to fetch matches");
  return response.json();
}

export async function getMatch(id: string): Promise<MatchDetail> {
  const response = await fetch(`/api/matches/${id}`);
  if (!response.ok) throw new Error("Failed to fetch match");
  return response.json();
}

export async function createMatch(file: File): Promise<{ matchId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/matches", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to import match");
  return data;
}

export async function deleteMatch(id: string): Promise<void> {
  const response = await fetch(`/api/matches/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete match");
  }
}
