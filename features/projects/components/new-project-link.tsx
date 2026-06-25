import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { bg } from "@/src/i18n/bg";

export function NewProjectLink() {
  return (
    <Button asChild>
      <Link href="/projects/new">
        <PlusIcon data-icon="inline-start" />
        {bg.projects.newLink}
      </Link>
    </Button>
  );
}
