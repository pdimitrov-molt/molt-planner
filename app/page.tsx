import { getProjects } from "@/features/projects/project.repository";
import { ProjectList } from "@/features/projects/components/project-list";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">MOLT Planner</h1>
            <p className="text-slate-500">
              AI Project Manager for Interior Design Studios
            </p>
          </div>
        </header>

        <div className="rounded-xl bg-white shadow">
          <div className="border-b p-5">
            <h2 className="text-xl font-semibold">
              Проекти
            </h2>
          </div>

          <ProjectList projects={projects} />
        </div>
      </div>
    </main>
  );
}