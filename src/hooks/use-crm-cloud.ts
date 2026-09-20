import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type CloudClient = Database["public"]["Tables"]["crm_clients"]["Row"];
export type CloudLead = Database["public"]["Tables"]["crm_leads"]["Row"];
export type CloudDeal = Database["public"]["Tables"]["crm_deals"]["Row"];

export const CLIENT_STATUSES = ["active", "prospect", "on_hold", "churned"] as const;
export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export const DEAL_STAGES = ["new_opportunity", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export const LEAD_SOURCES = ["Manual", "Website", "Referral", "Campaign", "Social", "Event", "Other"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];

function orgQuery<T>(table: "crm_clients" | "crm_leads" | "crm_deals", key: string, organizationId: string | undefined) {
  return {
    queryKey: ["cloud", key, organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      if (!organizationId) return [] as T[];
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  };
}

export function useOrgClients(organizationId: string | undefined) {
  return useQuery(orgQuery<CloudClient>("crm_clients", "crm-clients", organizationId));
}

export function useOrgLeads(organizationId: string | undefined) {
  return useQuery(orgQuery<CloudLead>("crm_leads", "crm-leads", organizationId));
}

export function useOrgDeals(organizationId: string | undefined) {
  return useQuery(orgQuery<CloudDeal>("crm_deals", "crm-deals", organizationId));
}

export function useCreateClient(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      company: string;
      contact_name: string;
      email: string;
      phone: string;
      website: string;
      industry: string;
      status: ClientStatus;
      notes: string;
      owner_id: string | null;
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data, error } = await supabase
        .from("crm_clients")
        .insert({ organization_id: organizationId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as CloudClient;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status?: ClientStatus; owner_id?: string | null }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("crm_clients").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useCreateLead(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      company: string;
      email: string;
      phone: string;
      source: string;
      status: LeadStatus;
      estimated_value: number;
      notes: string;
      assigned_to: string | null;
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data, error } = await supabase
        .from("crm_leads")
        .insert({ organization_id: organizationId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as CloudLead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status?: LeadStatus;
      assigned_to?: string | null;
      converted_client_id?: string | null;
    }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("crm_leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

/** Turns a lead into a client record and links the two together. */
export function useConvertLead(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: CloudLead) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data: client, error: clientError } = await supabase
        .from("crm_clients")
        .insert({
          organization_id: organizationId,
          company: lead.company || lead.name,
          contact_name: lead.name,
          email: lead.email,
          phone: lead.phone,
          industry: "General",
          status: "active",
          notes: lead.notes,
          owner_id: lead.assigned_to,
        })
        .select()
        .single();
      if (clientError) throw clientError;

      const { error: leadError } = await supabase
        .from("crm_leads")
        .update({ status: "won", converted_client_id: client.id })
        .eq("id", lead.id);
      if (leadError) throw leadError;

      const { error: dealError } = await supabase.from("crm_deals").insert({
        organization_id: organizationId,
        title: `${lead.company || lead.name} engagement`,
        client_id: client.id,
        lead_id: lead.id,
        value: lead.estimated_value,
        probability: 60,
        stage: "qualified",
        owner_id: lead.assigned_to,
      });
      if (dealError) throw dealError;
      return client as CloudClient;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useCreateDeal(organizationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      client_id: string | null;
      value: number;
      probability: number;
      stage: DealStage;
      expected_close_date: string | null;
      notes: string;
      owner_id: string | null;
    }) => {
      if (!organizationId) throw new Error("Select an organization first");
      const { data, error } = await supabase
        .from("crm_deals")
        .insert({ organization_id: organizationId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as CloudDeal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useUpdateDealCloud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      stage?: DealStage;
      probability?: number;
      owner_id?: string | null;
      value?: number;
    }) => {
      const { id, ...patch } = input;
      const { error } = await supabase.from("crm_deals").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("crm_deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud"] }),
  });
}
