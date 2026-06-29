"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cancelWaitingAction } from "@/features/workflow-engine/actions/workflow-waiting.actions";
import { FinishWaitingDialog } from "@/features/workflow-engine/components/finish-waiting-dialog";
import { getWaitingReasonLabel } from "@/features/workflow-engine/lib/waiting-reason-labels";
import type { WorkflowWaitingEvent } from "@/features/workflow-engine/types/workflow-waiting-event";
import { formatLongDate, formatShortDate } from "@/src/i18n/format";
import { bg } from "@/src/i18n/bg";

interface StageWaitingPanelProps {
  waiting: WorkflowWaitingEvent;
  onChanged: () => void;
  onOptimisticCancel?: () => void;
  onCancelFailed?: () => void;
  onOptimisticFinish?: () => void;
  onFinishFailed?: () => void;
}

export function StageWaitingPanel({
  waiting,
  onChanged,
  onOptimisticCancel,
  onCancelFailed,
  onOptimisticFinish,
  onFinishFailed,
}: StageWaitingPanelProps) {
  const [finishOpen, setFinishOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    onOptimisticCancel?.();

    startTransition(async () => {
      const result = await cancelWaitingAction({
        workflow_instance_id: waiting.workflow_instance_id,
      });

      if (!result.success) {
        onCancelFailed?.();
        toast.error(result.error);
        return;
      }

      toast.success(bg.workflowWaiting.cancelSuccess);
      onChanged();
    });
  }

  const reasonLabel = getWaitingReasonLabel(waiting.reason, waiting.custom_reason);

  return (
    <>
      <div className="grid gap-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
        <p className="text-base font-medium">{bg.workflowWaiting.activeTitle}</p>

        <div className="grid gap-2 text-sm">
          <WaitingRow label={bg.workflowWaiting.reasonLabel} value={reasonLabel} />
          <WaitingRow
            label={bg.workflowWaiting.startedAtLabel}
            value={formatLongDate(waiting.started_at)}
          />
          {waiting.expected_end_at ? (
            <WaitingRow
              label={bg.workflowWaiting.expectedReturnDateLabel}
              value={formatShortDate(waiting.expected_end_at)}
            />
          ) : null}
          {waiting.notes ? (
            <WaitingRow label={bg.workflowWaiting.notesLabel} value={waiting.notes} />
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => setFinishOpen(true)}
            disabled={isPending}
          >
            {bg.workflowWaiting.finishAction}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={handleCancel}
            disabled={isPending}
          >
            {bg.workflowWaiting.cancelAction}
          </Button>
        </div>
      </div>

      <FinishWaitingDialog
        open={finishOpen}
        onOpenChange={setFinishOpen}
        workflowInstanceId={waiting.workflow_instance_id}
        onFinished={onChanged}
        onOptimisticFinish={onOptimisticFinish}
        onFinishFailed={onFinishFailed}
      />
    </>
  );
}

function WaitingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
