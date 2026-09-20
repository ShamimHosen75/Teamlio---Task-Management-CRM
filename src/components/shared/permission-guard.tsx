import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { usePermissions } from "@/app/workspace";
import type { Permission } from "@/lib/permissions";
import { EmptyState } from "@/components/shared/states";

export function PermissionGuard({
  permission,
  children,
  fallback,
  mode = "hide",
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  mode?: "hide" | "page";
}) {
  const { can, roleName } = usePermissions();
  if (can(permission)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (mode === "page") {
    return (
      <EmptyState
        icon={Lock}
        title="You don't have access to this area"
        description={`The ${roleName} role is missing the “${permission}” permission. Switch role from the profile menu to preview other access levels.`}
      />
    );
  }
  return null;
}
