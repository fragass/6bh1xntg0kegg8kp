import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔐 validação de admin (ROBUSTA)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ error: "Token não enviado" });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: "Não autorizado" });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, name, content, created_at, to")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Erro ao buscar logs" });
  }

  return res.status(200).json(data);
}
