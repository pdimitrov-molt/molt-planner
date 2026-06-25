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
  getProjectTypeLabel,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_LABELS,
  PROJECT_TYPES,
} from "@/features/projects/types/project";
import type { WizardProjectInput } from "@/features/projects/validation/project-wizard.schema";
import { bg } from "@/src/i18n/bg";

interface WizardStepProjectProps {
  value: WizardProjectInput;
  onChange: (value: WizardProjectInput) => void;
}

export function WizardStepProject({ value, onChange }: WizardStepProjectProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="project-name">{bg.projects.wizard.projectName}</Label>
        <Input
          id="project-name"
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder={bg.projects.wizard.projectNamePlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="project-type">{bg.projects.wizard.projectType}</Label>
          <Select
            value={value.project_type}
            onValueChange={(projectType) =>
              onChange({
                ...value,
                project_type: projectType as WizardProjectInput["project_type"],
              })
            }
          >
            <SelectTrigger id="project-type">
              <SelectValue placeholder={bg.projects.wizard.selectProjectType} />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((projectType) => (
                <SelectItem key={projectType} value={projectType}>
                  {getProjectTypeLabel(projectType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <SelectTrigger id="project-priority">
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
    </div>
  );
}
