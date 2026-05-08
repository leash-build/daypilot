CREATE TABLE IF NOT EXISTS plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  events       jsonb NOT NULL,
  messages     jsonb NOT NULL,
  plan         jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS plans_user_recent ON plans (user_id, generated_at DESC);
