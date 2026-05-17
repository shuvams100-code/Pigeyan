export type Agency = {
  id: string;
  name: string;
  email: string;
  plan: string;
  gmail_token: string | null;
  outlook_token: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  agency_id: string;
  name: string;
  company: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  health_status: string;
  last_interaction_at: string | null;
  next_action_at: string | null;
  created_at: string;
};
