import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { adminPassword } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.status(500).json({ error: "Erro ao buscar usuários" });

  res.status(200).json(data);
}
