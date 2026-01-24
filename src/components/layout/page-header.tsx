import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  backHref?: string;
  children?: React.ReactNode;
  description?: string;
  title: string;
}

export function PageHeader({
  title,
  description,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-4">
          {backHref && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref}>← Back</Link>
            </Button>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
