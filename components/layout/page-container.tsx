import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  width?: "md" | "lg" | "xl" | "full";
}

const WIDTH_CLASS = {
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const;

export function PageContainer({ children, width = "xl" }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 flex-col px-6 py-8 sm:px-8 sm:py-10",
        width === "full" ? "gap-8" : "gap-12",
        WIDTH_CLASS[width]
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
        <h1 className="text-display">{title}</h1>
        {description ? <p className="text-body">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function SurfaceCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card flex flex-col gap-6 p-6 sm:p-8", className)}>
      {children}
    </section>
  );
}

export function InsetPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("surface-inset", className)}>{children}</div>;
}
