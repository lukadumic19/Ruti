import type { AutomationId } from "./ids";

/** Appens egne automatiseringsregler – kun læsning + til/fra i v1. */
export interface Automation {
  id: AutomationId;
  name: string;
  description: string;
  enabled: boolean;
}
