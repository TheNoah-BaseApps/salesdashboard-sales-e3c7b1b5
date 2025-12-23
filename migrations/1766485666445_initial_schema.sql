CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS website_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  ip text NOT NULL,
  owner_contact text,
  number_of_visits integer DEFAULT 1 NOT NULL,
  page_visits text,
  website_duration integer,
  location text NOT NULL,
  time time without time zone NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_website_visits_ip_date ON website_visits (ip, date);
CREATE INDEX IF NOT EXISTS idx_website_visits_owner_contact ON website_visits (owner_contact);
CREATE INDEX IF NOT EXISTS idx_website_visits_date ON website_visits (date);

CREATE TABLE IF NOT EXISTS store_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  owner_contact text NOT NULL,
  number_of_visits integer DEFAULT 1 NOT NULL,
  location text NOT NULL,
  time time without time zone NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_store_visits_owner_contact ON store_visits (owner_contact);
CREATE INDEX IF NOT EXISTS idx_store_visits_date ON store_visits (date);
CREATE INDEX IF NOT EXISTS idx_store_visits_location ON store_visits (location);

CREATE TABLE IF NOT EXISTS login_signup (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  username text NOT NULL,
  email text NOT NULL,
  location text NOT NULL,
  time time without time zone NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_signup_email ON login_signup (email);
CREATE INDEX IF NOT EXISTS idx_login_signup_date ON login_signup (date);