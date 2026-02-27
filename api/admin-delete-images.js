export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = "images"; // 👈 nome exato do seu bucket

  try {
    // 1️⃣ Listar arquivos do bucket
    const listRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
      {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prefix: "",
          limit: 1000
        })
      }
    );

    const files = await listRes.json();

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(200).json({ success: true, deleted: 0 });
    }

    // 2️⃣ Extrair caminhos
    const prefixes = files.map(file => file.name);

    // 3️⃣ Deletar arquivos
    const deleteRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prefixes })
      }
    );

    if (!deleteRes.ok) {
      const error = await deleteRes.text();
      return res.status(500).json({ error });
    }

    return res.status(200).json({
      success: true,
      deleted: prefixes.length
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
