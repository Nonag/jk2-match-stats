"use client";

import { MatchCSVImportDialog } from "@/components/match";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();

  const handleImportSuccess = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Import Match Data</h2>
          <p className="text-sm text-muted-foreground">
            Upload CSV files to import match statistics
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Import match data from JK2 CTF match CSV files
            </p>
            <MatchCSVImportDialog onImportSuccess={handleImportSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
