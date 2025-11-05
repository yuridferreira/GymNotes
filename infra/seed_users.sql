-- Seed: cria tabela users e insere registros de exemplo
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

INSERT INTO users (name, email) VALUES
  ('Yuri', 'yuri@gmail.com'),
  ('Jean Carlos', 'jean@gmail.com')
ON CONFLICT (email) DO NOTHING;
