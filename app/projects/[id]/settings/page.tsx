import { ProjectSettingsPage } from "@/features/project-settings/components/project-settings-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page(props: PageProps) {
  return <ProjectSettingsPage params={props.params} />;
}
