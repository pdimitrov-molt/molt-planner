"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardEmptyState,
  DashboardPanel,
  DASHBOARD_CARD_CLASS,
  DASHBOARD_CARD_INTERACTIVE_CLASS,
} from "@/features/studio-dashboard/components/dashboard-ui";
import { deletePersonalItemAction } from "@/features/personal-items/actions/personal-item.actions";
import { PersonalItemFormDialog } from "@/features/personal-items/components/personal-item-form-dialog";
import {
  DEFAULT_PERSONAL_ITEM_FILTERS,
  filterPersonalItems,
  hasActivePersonalItemFilters,
  type PersonalItemFilters,
} from "@/features/personal-items/lib/filter-personal-items";
import {
  PERSONAL_ITEM_CATEGORIES,
  PERSONAL_ITEM_PRIORITIES,
  PERSONAL_ITEM_STATUSES,
  type PersonalItem,
  type PersonalItemCategory,
  type PersonalItemPriority,
  type PersonalItemStatus,
} from "@/features/personal-items/types/personal-item";
import { formatShortDate } from "@/src/i18n/format";
import { bg } from "@/src/i18n/bg";
import { cn } from "@/lib/utils";

interface PersonalItemsDashboardProps {
  items: PersonalItem[];
}

const STATUS_STYLES: Record<PersonalItemStatus, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-[#3B82F6]/15 text-[#93C5FD]",
  DONE: "bg-[#35D07F]/15 text-[#35D07F]",
  CANCELLED: "bg-[#EF4444]/10 text-[#FCA5A5]",
};

const PRIORITY_STYLES: Record<PersonalItemPriority, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-[#F59E0B]",
  urgent: "text-[#EF4444]",
};

export function PersonalItemsDashboard({ items }: PersonalItemsDashboardProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<PersonalItemFilters>(DEFAULT_PERSONAL_ITEM_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PersonalItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonalItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const filteredItems = useMemo(
    () => filterPersonalItems(items, filters),
    [items, filters]
  );

  const handleRefresh = () => {
    router.refresh();
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditDialog = (item: PersonalItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setActionError(null);

    startDeleteTransition(async () => {
      const result = await deletePersonalItemAction(deleteTarget.id);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setDeleteTarget(null);
      handleRefresh();
    });
  };

  return (
    <>
      <PageHeader
        title={bg.personalItems.title}
        description={bg.personalItems.subtitle}
        action={
          <Button onClick={openCreateDialog}>
            <PlusIcon />
            {bg.personalItems.newItem}
          </Button>
        }
      />

      <div className="grid gap-5">
        <DashboardPanel title={bg.personalItems.filters.title} plainHeader className="gap-4 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label={bg.personalItems.fields.category}>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    category: value as PersonalItemCategory | "all",
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{bg.personalItems.filters.all}</SelectItem>
                  {PERSONAL_ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {bg.personalItems.category[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label={bg.personalItems.fields.priority}>
              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    priority: value as PersonalItemPriority | "all",
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{bg.personalItems.filters.all}</SelectItem>
                  {PERSONAL_ITEM_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {bg.personalItems.priority[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label={bg.personalItems.fields.dueDate}>
              <Select
                value={filters.dueDate}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    dueDate: value as PersonalItemFilters["dueDate"],
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{bg.personalItems.filters.dueAll}</SelectItem>
                  <SelectItem value="overdue">{bg.personalItems.filters.dueOverdue}</SelectItem>
                  <SelectItem value="today">{bg.personalItems.filters.dueToday}</SelectItem>
                  <SelectItem value="upcoming">{bg.personalItems.filters.dueUpcoming}</SelectItem>
                  <SelectItem value="none">{bg.personalItems.filters.dueNone}</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label={bg.personalItems.fields.status}>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    status: value as PersonalItemStatus | "all",
                  }))
                }
              >
                <SelectTrigger className="rounded-[1.125rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{bg.personalItems.filters.all}</SelectItem>
                  {PERSONAL_ITEM_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {bg.personalItems.status[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
          </div>

          {hasActivePersonalItemFilters(filters) ? (
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters(DEFAULT_PERSONAL_ITEM_FILTERS)}
              >
                {bg.personalItems.filters.reset}
              </Button>
            </div>
          ) : null}
        </DashboardPanel>

        <DashboardPanel
          title={`${bg.personalItems.title} (${filteredItems.length})`}
          plainHeader
          className="gap-4"
        >
          {items.length === 0 ? (
            <DashboardEmptyState>{bg.personalItems.empty}</DashboardEmptyState>
          ) : filteredItems.length === 0 ? (
            <DashboardEmptyState>{bg.personalItems.noResults}</DashboardEmptyState>
          ) : (
            <ul className="grid gap-3">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <article
                    className={cn(
                      "grid gap-4 p-5 sm:grid-cols-[1fr_auto]",
                      DASHBOARD_CARD_CLASS,
                      DASHBOARD_CARD_INTERACTIVE_CLASS
                    )}
                  >
                    <div className="grid min-w-0 gap-3">
                      <div className="flex flex-wrap items-start gap-2">
                        <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            STATUS_STYLES[item.status]
                          )}
                        >
                          {bg.personalItems.status[item.status]}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}

                      <dl className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                        <MetaItem
                          label={bg.personalItems.fields.category}
                          value={bg.personalItems.category[item.category]}
                        />
                        <MetaItem
                          label={bg.personalItems.fields.priority}
                          value={bg.personalItems.priority[item.priority]}
                          valueClassName={PRIORITY_STYLES[item.priority]}
                        />
                        <MetaItem
                          label={bg.personalItems.fields.dueDate}
                          value={item.due_date ? formatShortDate(item.due_date) : bg.common.empty}
                        />
                        <MetaItem
                          label={bg.personalItems.fields.status}
                          value={bg.personalItems.status[item.status]}
                        />
                      </dl>
                    </div>

                    <div className="flex shrink-0 items-start gap-2 sm:flex-col sm:items-end">
                      <Button variant="secondary" size="sm" onClick={() => openEditDialog(item)}>
                        <PencilIcon />
                        {bg.personalItems.editItem}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2Icon />
                        {bg.personalItems.deleteItem}
                      </Button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      <PersonalItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        onSuccess={handleRefresh}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-[1.125rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bg.personalItems.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>{bg.personalItems.deleteConfirmDescription}</DialogDescription>
          </DialogHeader>
          {deleteTarget ? (
            <p className="text-sm font-medium">{deleteTarget.title}</p>
          ) : null}
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {bg.personalItems.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {bg.personalItems.deleteItem}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MetaItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", valueClassName)}>{value}</dd>
    </div>
  );
}
