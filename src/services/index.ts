import type { AppServices } from "./interfaces";
import { mockServices } from "./mock";

/**
 * Single provider entry point. Swapping the mock provider for a Supabase
 * provider later is a one-line change here — the UI and hooks stay untouched.
 */
export const services: AppServices = mockServices;

export type { AppServices } from "./interfaces";
