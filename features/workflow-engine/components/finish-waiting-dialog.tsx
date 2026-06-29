"use client";

import { useTransition } from "react";
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
import { finishWaitingAction } from "@/features/workflow-engine/actions/workflow-waiting.actions";
import { bg } from "@/src/i18n/bg";

interface FinishWaitingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowInstanceId: string;
  onFinished: () => void;
  onOptimisticFinish?: () => void;
  onFinishFailed?: () => void;
}

export function FinishWaitingDialog({
  open,
  onOpenChange,
  workflowInstanceId,
  onFinished,
  onOptimisticFinish,
  onFinishFailed,
}: FinishWaitingDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleFinish() {
    onOptimisticFinish?.();
    onOpenChange(false);

    startTransition(async () => {
      const result = await finishWaitingAction({
        workflow_instance_id: workflowInstanceId,
      });

      if (!result.success) {
        onFinishFailed?.();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workflowWaiting.finishSuccess);
      onFinished();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workflowWaiting.finishDialogTitle}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {bg.workflowWaiting.finishDialogMessage}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleFinish}
            disabled={isPending}
          >
            {bg.workflowWaiting.finishDialogNo}
          </Button>
          <Button type="button" onClick={handleFinish} disabled={isPending}>
            {bg.workflowWaiting.finishDialogYes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
