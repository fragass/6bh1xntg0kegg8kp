import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔒 Proteção simples por ENV (igual suas outras rotas)
  if (req.headers["x-admin"] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Não autorizado" });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, name, content, created_at, to")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
