"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createPersonalItemAction } from "@/features/personal-items/actions/personal-item.actions";
import { cn } from "@/lib/utils";
import { bg } from "@/src/i18n/bg";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      setText("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const title = text.trim();

    if (!title) {
      setError(bg.quickCapture.validationRequired);
      return;
    }

    startTransition(async () => {
      const result = await createPersonalItemAction({ title });

      if (!result.success) {
        setError(result.error);
        return;
      }

      toast.success(bg.quickCapture.success);
      setOpen(false);
    });
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-5 pl-[calc(250px+1.25rem)] max-md:pl-5">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "pointer-events-auto h-12 gap-2 rounded-full px-5 shadow-[var(--card-shadow)]",
            "hover:-translate-y-0.5 hover:shadow-lg"
          )}
        >
          <PlusIcon className="size-5" />
          <span>{bg.quickCapture.buttonLabel}</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bg.quickCapture.title}</DialogTitle>
            <DialogDescription>{bg.quickCapture.description}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <Input
              ref={inputRef}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder={bg.quickCapture.placeholder}
              disabled={isPending}
              aria-invalid={Boolean(error)}
              autoComplete="off"
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {bg.quickCapture.cancel}
              </Button>
              <Button type="submit" disabled={isPending || !text.trim()}>
                {isPending ? bg.quickCapture.saving : bg.quickCapture.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
