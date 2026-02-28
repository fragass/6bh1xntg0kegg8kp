import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { username, password, adminPassword } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  if (!username || !password) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const { error } = await supabase
      .from("users")
      .insert([{ username, password }]);

    if (error) throw error;

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}