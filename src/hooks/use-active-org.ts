import { useCallback, useEffect, useState } from "react";
import { useMyOrganizations } from "@/hooks/use-cloud";

const STORAGE_KEY = "live-active-org-id";

/** Shared selected organization across every live (Supabase-backed) page. */
export function useActiveOrg() {
  const { data: orgs = [], isLoading } = useMyOrganizations();
  const [orgId, setOrgIdState] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setOrgIdState(stored);
  }, []);

  useEffect(() => {
    if (!orgs.length) return;
    if (!orgId || !orgs.some((o) => o.id === orgId)) setOrgIdState(orgs[0]?.id);
  }, [orgs, orgId]);

  const setOrgId = useCallback((next: string) => {
    setOrgIdState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const activeOrgId = orgId && orgs.some((o) => o.id === orgId) ? orgId : orgs[0]?.id;

  return {
    orgs,
    isLoading,
    activeOrgId,
    activeOrg: orgs.find((o) => o.id === activeOrgId),
    setOrgId,
  };
}
