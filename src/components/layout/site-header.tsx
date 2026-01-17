"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "./mode-toggle";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Matches" }];
  }

  const breadcrumbs: BreadcrumbSegment[] = [];

  if (segments[0] === "matches") {
    breadcrumbs.push({ label: "Matches", href: "/" });
    if (segments[1]) {
      breadcrumbs.push({ label: "Match Details" });
    }
  } else if (segments[0] === "players") {
    breadcrumbs.push({ label: "Players" });
  } else if (segments[0] === "import") {
    breadcrumbs.push({ label: "Import" });
  } else {
    breadcrumbs.push({ label: segments[0].charAt(0).toUpperCase() + segments[0].slice(1) });
  }

  return breadcrumbs;
}

export function SiteHeader() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => (
              <BreadcrumbItem key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                {segment.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
