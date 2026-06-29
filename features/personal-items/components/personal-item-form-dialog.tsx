"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createPersonalItemAction,
  updatePersonalItemAction,
} from "@/features/personal-items/actions/personal-item.actions";
import {
  PERSONAL_ITEM_CATEGORIES,
  PERSONAL_ITEM_PRIORITIES,
  PERSONAL_ITEM_STATUSES,
  type PersonalItem,
  type PersonalItemCategory,
  type PersonalItemPriority,
  type PersonalItemStatus,
} from "@/features/personal-items/types/personal-item";
import { bg } from "@/src/i18n/bg";

interface PersonalItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PersonalItem | null;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "personal" as PersonalItemCategory,
  priority: "normal" as PersonalItemPriority,
  status: "TODO" as PersonalItemStatus,
  due_date: "",
};

export function PersonalItemFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: PersonalItemFormDialogProps) {
  const isEditing = Boolean(item);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    if (item) {
      setForm({
        title: item.title,
        description: item.description ?? "",
        category: item.category,
        priority: item.priority,
        status: item.status,
        due_date: item.due_date ?? "",
      });
      return;
    }

    setForm(EMPTY_FORM);
  };

  useEffect(() => {
    if (open) {
      resetForm();
      setError(null);
    }
  }, [open, item]);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      };

      const result = isEditing && item
        ? await updatePersonalItemAction({ id: item.id, ...payload })
        : await createPersonalItemAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[1.125rem] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? bg.personalItems.editItem : bg.personalItems.newItem}
          </DialogTitle>
          <DialogDescription>{bg.personalItems.subtitle}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="personal-item-title">{bg.personalItems.fields.title}</Label>
            <Input
              id="personal-item-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personal-item-description">
              {bg.personalItems.fields.description}
            </Label>
            <Textarea
              id="personal-item-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{bg.personalItems.fields.category}</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value as PersonalItemCategory,
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAL_ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {bg.personalItems.category[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{bg.personalItems.fields.priority}</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as PersonalItemPriority,
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAL_ITEM_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {bg.personalItems.priority[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="personal-item-due-date">{bg.personalItems.fields.dueDate}</Label>
              <Input
                id="personal-item-due-date"
                type="date"
                value={form.due_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, due_date: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>{bg.personalItems.fields.status}</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as PersonalItemStatus,
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAL_ITEM_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {bg.personalItems.status[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {bg.personalItems.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditing ? bg.personalItems.save : bg.personalItems.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
