"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { startWaitingAction } from "@/features/workflow-engine/actions/workflow-waiting.actions";
import { buildOptimisticWaitingEvent } from "@/features/workflow-engine/lib/optimistic-waiting-event";
import { WORKFLOW_WAITING_REASON_OPTIONS } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import type { WorkflowWaitingReason } from "@/features/workflow-engine/types/workflow-waiting-event";
import { bg } from "@/src/i18n/bg";

interface StartWaitingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  workflowInstanceId: string;
  onStarted: () => void;
  onOptimisticStart?: (event: WorkflowWaitingEvent) => void;
  onStartFailed?: () => void;
}

function dateInputToIso(dateValue: string): string {
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

export function StartWaitingDialog({
  open,
  onOpenChange,
  projectId,
  workflowInstanceId,
  onStarted,
  onOptimisticStart,
  onStartFailed,
}: StartWaitingDialogProps) {
  const [reason, setReason] = useState<WorkflowWaitingReason>("client_approval");
  const [customReason, setCustomReason] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setReason("client_approval");
    setCustomReason("");
    setExpectedDate("");
    setNotes("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    const customReasonValue = reason === "other" ? customReason.trim() : null;
    const expectedEndAt = expectedDate ? dateInputToIso(expectedDate) : null;
    const notesValue = notes.trim() ? notes.trim() : null;

    onOptimisticStart?.(
      buildOptimisticWaitingEvent({
        projectId,
        workflowInstanceId,
        reason,
        custom_reason: customReasonValue,
        expected_end_at: expectedEndAt,
        notes: notesValue,
      })
    );
    resetForm();
    onOpenChange(false);

    startTransition(async () => {
      const result = await startWaitingAction({
        project_id: projectId,
        workflow_instance_id: workflowInstanceId,
        reason,
        custom_reason: customReasonValue,
        expected_end_at: expectedEndAt,
        notes: notesValue,
      });

      if (!result.success) {
        onStartFailed?.();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workflowWaiting.startSuccess);
      onStarted();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{bg.workflowWaiting.startDialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="waiting-reason">{bg.workflowWaiting.reasonLabel}</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as WorkflowWaitingReason)}
              disabled={isPending}
            >
              <SelectTrigger id="waiting-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOW_WAITING_REASON_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {bg.workflowWaiting.reasons[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === "other" ? (
            <div className="grid gap-2">
              <Label htmlFor="waiting-custom-reason">
                {bg.workflowWaiting.customReasonLabel}
              </Label>
              <Textarea
                id="waiting-custom-reason"
                value={customReason}
                onChange={(event) => setCustomReason(event.target.value)}
                rows={3}
                disabled={isPending}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="waiting-expected-date">
              {bg.workflowWaiting.expectedReturnDateLabel}
            </Label>
            <Input
              id="waiting-expected-date"
              type="date"
              value={expectedDate}
              onChange={(event) => setExpectedDate(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="waiting-notes">{bg.workflowWaiting.notesLabel}</Label>
            <Textarea
              id="waiting-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {bg.workSession.cancel}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? bg.workflowWaiting.starting : bg.workflowWaiting.startAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
