import { Button } from "@/components/ui/button";

export default function Home() {
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

          <Button>+ Нов проект</Button>
        </header>

        <div className="grid grid-cols-4 gap-6 mb-8">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Активни проекти</p>
            <h2 className="text-4xl font-bold mt-2">12</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Оставащи часове</p>
            <h2 className="text-4xl font-bold mt-2">486</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Свободен старт</p>
            <h2 className="text-2xl font-bold mt-2">18.08.2026</h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Натоварване</p>
            <h2 className="text-4xl font-bold mt-2">96%</h2>
          </div>

        </div>

        <div className="rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-semibold">
              Проекти
            </h2>
          </div>

          <div className="divide-y">

            {[
              "Хотел Созопол",
              "Апартамент Иванови",
              "STEM Бургас"
            ].map(project => (
              <div
                key={project}
                className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer"
              >
                <span>{project}</span>

                <span className="text-slate-500">
                  42%
                </span>

              </div>
            ))}

          </div>

        </div>

      </div>
    </main>
  );
}