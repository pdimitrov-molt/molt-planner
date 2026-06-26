"use client";

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
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  PROJECT_OBJECT_TYPES,
  PROJECT_OBJECT_TYPE_LABELS,
  PROJECT_PACKAGES,
  PROJECT_PACKAGE_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABELS,
} from "@/features/projects/types/project";
import type { WizardProjectInput } from "@/features/projects/validation/project-wizard.schema";
import { bg } from "@/src/i18n/bg";

interface WizardStepProjectProps {
  value: WizardProjectInput;
  onChange: (value: WizardProjectInput) => void;
}

export function WizardStepProject({ value, onChange }: WizardStepProjectProps) {
  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <Label htmlFor="project-name">{bg.projects.wizard.projectName}</Label>
        <Input
          id="project-name"
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder={bg.projects.wizard.projectNamePlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="project-category">{bg.projects.wizard.category}</Label>
          <Select
            value={value.category}
            onValueChange={(category) =>
              onChange({
                ...value,
                category: category as WizardProjectInput["category"],
              })
            }
          >
            <SelectTrigger id="project-category">
              <SelectValue placeholder={bg.projects.wizard.selectCategory} />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {PROJECT_CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="object-type">{bg.projects.wizard.objectType}</Label>
          <Select
            value={value.object_type}
            onValueChange={(objectType) =>
              onChange({
                ...value,
                object_type: objectType as WizardProjectInput["object_type"],
              })
            }
          >
            <SelectTrigger id="object-type">
              <SelectValue placeholder={bg.projects.wizard.selectObjectType} />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_OBJECT_TYPES.map((objectType) => (
                <SelectItem key={objectType} value={objectType}>
                  {PROJECT_OBJECT_TYPE_LABELS[objectType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-package">{bg.projects.wizard.package}</Label>
          <Select
            value={value.package}
            onValueChange={(projectPackage) =>
              onChange({
                ...value,
                package: projectPackage as WizardProjectInput["package"],
              })
            }
          >
            <SelectTrigger id="project-package">
              <SelectValue placeholder={bg.projects.wizard.selectPackage} />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_PACKAGES.map((projectPackage) => (
                <SelectItem key={projectPackage} value={projectPackage}>
                  {PROJECT_PACKAGE_LABELS[projectPackage]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project-priority">{bg.projects.wizard.priority}</Label>
        <Select
          value={value.priority}
          onValueChange={(priority) =>
            onChange({
              ...value,
              priority: priority as WizardProjectInput["priority"],
            })
          }
        >
          <SelectTrigger id="project-priority" className="max-w-xs">
            <SelectValue placeholder={bg.projects.wizard.selectPriority} />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PROJECT_PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="site-address">{bg.projects.wizard.siteAddress}</Label>
        <Textarea
          id="site-address"
          value={value.site_address ?? ""}
          onChange={(event) =>
            onChange({ ...value, site_address: event.target.value })
          }
          placeholder={bg.projects.wizard.siteAddressPlaceholder}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="site-area">{bg.projects.wizard.siteArea}</Label>
        <Input
          id="site-area"
          type="number"
          min="0"
          step="0.1"
          className="max-w-xs"
          value={value.site_area ?? ""}
          onChange={(event) =>
            onChange({
              ...value,
              site_area:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
          placeholder={bg.projects.wizard.siteAreaPlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="design-deadline">{bg.projects.wizard.designDeadline}</Label>
          <Input
            id="design-deadline"
            type="date"
            value={value.design_deadline ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                design_deadline: event.target.value || null,
              })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="execution-deadline">
            {bg.projects.wizard.executionDeadline}
          </Label>
          <Input
            id="execution-deadline"
            type="date"
            value={value.execution_deadline ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                execution_deadline: event.target.value || null,
              })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="move-in-date">{bg.projects.wizard.moveInDate}</Label>
          <Input
            id="move-in-date"
            type="date"
            value={value.move_in_date ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                move_in_date: event.target.value || null,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
