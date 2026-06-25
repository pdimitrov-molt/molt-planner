import { Project } from "@/types/project";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="p-6 text-slate-500">
        Все още няма създадени проекти.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
        >
          <div>
            <h3 className="font-semibold">{project.name}</h3>

            <p className="text-sm text-slate-500">
              {project.project_type}
            </p>
          </div>

          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm">
            {project.status}
          </span>
        </div>
      ))}
    </div>
  );
}