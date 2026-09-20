import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ORG_ROLE_TO_ROLE_NAME, ROLE_PERMISSIONS, type Permission } from "@/lib/permissions";
import { organizations, roles, users } from "@/lib/mock/seed";
import { CURRENT_USER_ID, DEFAULT_ORG_ID } from "@/services/store";
import { useActiveOrg } from "@/hooks/use-active-org";
import { useMyMembership } from "@/hooks/use-cloud";
import type { Organization, User } from "@/lib/types";

interface WorkspaceValue {
  organization: Organization;
  organizations: Organization[];
  setOrganizationId: (id: string) => void;
  currentUser: User;
  roleName: string;
  setRoleName: (name: string) => void;
  /** True when the role comes from a live workspace membership instead of the demo switcher. */
  roleIsLive: boolean;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [organizationId, setOrganizationId] = useState(DEFAULT_ORG_ID);
  const currentUser = users.find((u) => u.id === CURRENT_USER_ID)!;
  const defaultRole = roles.find((r) => r.id === currentUser.role_id)?.name ?? "Organization Owner";
  const [demoRoleName, setRoleName] = useState(defaultRole);

  const { activeOrgId } = useActiveOrg();
  const { data: membership } = useMyMembership(activeOrgId);
  const liveRoleName = membership ? ORG_ROLE_TO_ROLE_NAME[membership.role] : undefined;
  const roleName = liveRoleName ?? demoRoleName;

  const permissions = useMemo(() => ROLE_PERMISSIONS[roleName] ?? [], [roleName]);
  const can = useCallback((permission: Permission) => permissions.includes(permission), [permissions]);

  const value = useMemo<WorkspaceValue>(
    () => ({
      organization: organizations.find((o) => o.id === organizationId) ?? organizations[0],
      organizations,
      setOrganizationId,
      currentUser,
      roleName,
      setRoleName,
      roleIsLive: !!liveRoleName,
      permissions,
      can,
    }),
    [organizationId, currentUser, roleName, liveRoleName, permissions, can],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function usePermissions() {
  const { can, permissions, roleName, roleIsLive } = useWorkspace();
  return { can, permissions, roleName, roleIsLive };
}

export function useOrgId() {
  return useWorkspace().organization.id;
}
