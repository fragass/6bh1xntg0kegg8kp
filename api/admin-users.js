import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // só aceitar GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // checa token enviado pelo front-end
  const adminToken = req.headers["x-admin-token"];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  // cria cliente Supabase usando variáveis do Vercel
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, password"); // password idealmente é hash
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}