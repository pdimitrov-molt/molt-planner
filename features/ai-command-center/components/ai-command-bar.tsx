"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { CornerDownLeftIcon, MicIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAICommandShortcut } from "@/features/ai-command-center/hooks/use-ai-command-shortcut";
import { AI_COMMAND_BAR_PLACEHOLDER } from "@/features/ai-command-center/lib/constants";
import {
  dummyGateway,
  logGatewayResponse,
} from "@/features/ai-command-center/services/ai-gateway.service";
import { cn } from "@/lib/utils";

export function AICommandBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useAICommandShortcut(focusInput);

  function submitCommand() {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    const response = dummyGateway.interpret(trimmed);
    logGatewayResponse(response);
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCommand();
  }

  return (
    <div className="sticky top-0 z-30 -mx-1 px-1 pb-5 pt-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background via-background/95 to-transparent" />

      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center gap-3 rounded-[16px] border border-border bg-card px-4 py-3 shadow-[var(--card-shadow)]",
          "transition-[border-color,box-shadow] duration-200",
          "focus-within:border-ring/50 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
        )}
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center text-xl leading-none"
          aria-hidden
        >
          ✨
        </span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={AI_COMMAND_BAR_PLACEHOLDER}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-lg"
          aria-label={AI_COMMAND_BAR_PLACEHOLDER}
          autoComplete="off"
          spellCheck={false}
        />

        <div className="flex shrink-0 items-center gap-2">
          <Button type="submit" size="sm" className="rounded-[12px] px-4">
            <CornerDownLeftIcon className="size-4" />
            Enter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-[12px]"
            disabled
            aria-label="Микрофон"
          >
            <MicIcon className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
