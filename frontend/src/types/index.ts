export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
  skip_reason?: string;
  [key: string]: string | undefined;
}

export interface ImportSummary {
  total_rows: number;
  total_imported: number;
  total_skipped: number;
}

export interface ImportResponse {
  success: boolean;
  summary: ImportSummary;
  imported: CrmRecord[];
  skipped: CrmRecord[];
}

export type Step = 1 | 2 | 3 | 4;
