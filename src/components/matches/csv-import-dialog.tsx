"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useImportMatch } from "@/hooks/use-matches";
import { toast } from "sonner";

interface CSVImportDialogProps {
  onImportSuccess?: () => void;
}

export function CSVImportDialog({ onImportSuccess }: CSVImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { importMatch, loading } = useImportMatch();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid CSV file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    const result = await importMatch(selectedFile);
    
    if (result.success) {
      toast.success("Match imported successfully!");
      setSelectedFile(null);
      setOpen(false);
      onImportSuccess?.();
    } else {
      toast.error("Failed to import match");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Match CSV</DialogTitle>
          <DialogDescription>
            Upload a match statistics CSV file to import the data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card
            {...getRootProps()}
            className={`cursor-pointer border-2 border-dashed transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <CardContent className="flex flex-col items-center justify-center py-8">
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="text-center">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : isDragActive ? (
                <p className="text-muted-foreground">Drop the CSV file here...</p>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Drag & drop a CSV file here, or click to select
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!selectedFile || loading}>
              {loading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
