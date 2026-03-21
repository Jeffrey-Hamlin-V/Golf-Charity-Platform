export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'none';
  subscription_plan: 'monthly' | 'yearly' | 'none';
  subscription_id: string | null;
  subscription_renewal_date: string | null;
  charity_id: string | null;
  charity_contribution_pct: number;
  created_at: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  website: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type Score = {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
  created_at: string;
};

export type Draw = {
  id: string;
  month: string;
  numbers: number[];
  logic: string;
  status: 'upcoming' | 'completed';
  jackpot_amount: number;
  pool_4match: number;
  pool_3match: number;
  jackpot_rollover: boolean;
  created_at: string;
};

export type DrawEntry = {
  id: string;
  draw_id: string;
  user_id: string;
  numbers: number[];
  matched: number;
  created_at: string;
};

export type Winner = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 'jackpot' | '4match' | '3match';
  prize_amount: number;
  proof_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  payout_status: 'pending' | 'paid' | 'failed';
  created_at: string;
};
