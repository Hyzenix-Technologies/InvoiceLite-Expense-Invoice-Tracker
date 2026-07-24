"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <Card className="mx-auto mt-20 max-w-lg">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-slate-950">
            We couldn&apos;t load this page
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your data is safe. Try again, or return to this page in a moment.
          </p>
          <Button onClick={reset} className="mt-6">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
