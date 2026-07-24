import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string; icon: LucideIcon };
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="page-heading">{title}</h1>
        <p className="page-subheading">{description}</p>
      </div>
      {action && (
        <Button asChild size="lg" className="sm:self-center">
          <Link href={action.href}>
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
