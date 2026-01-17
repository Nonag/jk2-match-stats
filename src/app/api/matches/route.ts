import { NextRequest, NextResponse } from "next/server";
import { getAllMatches, importMatch, checkMatchExists } from "@/lib/db/match";
import { parseCSV } from "@/lib/utils";

export async function GET() {
  try {
    const matches = await getAllMatches();
    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const fileName = file.name;

    // Check if match already exists
    const exists = await checkMatchExists(fileName);
    if (exists) {
      return NextResponse.json(
        { error: "Match already imported" },
        { status: 409 }
      );
    }

    const csvContent = await file.text();
    const parsedData = parseCSV(csvContent, fileName);

    const match = await importMatch(parsedData);

    return NextResponse.json({
      success: true,
      matchId: match.id,
      message: "Match imported successfully"
    });
  } catch (error) {
    console.error("Error importing match:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import match" },
      { status: 500 }
    );
  }
}
