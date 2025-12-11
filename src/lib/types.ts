export interface KBEntry {
  id: string;
  category: string;
  triggers: string[];
  answer: string;
  followup?: string;
  escalate?: boolean;
}
