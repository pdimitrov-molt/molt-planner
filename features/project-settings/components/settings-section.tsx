import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-6 grid gap-1">
        <h2 className="text-title">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
