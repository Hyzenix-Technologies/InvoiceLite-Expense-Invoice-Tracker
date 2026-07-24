import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <AppShell>
      <Card className="mx-auto mt-20 max-w-lg">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileQuestion className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-slate-950">
            This page is out of range
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The record may have been removed or the address may be incorrect.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
