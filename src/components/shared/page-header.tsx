import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, tabs, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 min-w-0 space-y-4 sm:mb-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
           <h1 className="break-words text-xl font-semibold sm:text-2xl">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
         {actions ? <div className="grid w-full min-w-0 gap-2 [&>*]:min-w-0 [&_[role=combobox]]:w-full [&_button]:max-w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:[&_[role=combobox]]:w-auto">{actions}</div> : null}
      </div>
      {tabs}
    </div>
  );
}
