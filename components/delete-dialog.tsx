"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeleteDialog({
  title,
  description,
  action,
  compact = false,
}: {
  title: string;
  description: string;
  action: () => Promise<void>;
  compact?: boolean;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "default"}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          aria-label={compact ? title : undefined}
        >
          <Trash2 className="h-4 w-4" />
          {!compact && "Delete"}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </span>
          <AlertDialog.Title className="mt-4 text-lg font-bold text-slate-950">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <form action={action}>
              <AlertDialog.Action asChild>
                <Button type="submit" variant="destructive">
                  Delete permanently
                </Button>
              </AlertDialog.Action>
            </form>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
