export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminToken = req.headers["x-admin-password"];
  const { confirm } = req.body;

  if (!adminToken || adminToken !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (confirm !== "DELETE_IMAGES") {
    return res.status(400).json({ error: "Confirmation required" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = "chat-images"; // ⬅️ MUDE AQUI se o nome for outro

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    /* ===========================
       LISTA TODOS OS ARQUIVOS
    ============================ */
    const listResponse = await fetch(
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

    if (!listResponse.ok) {
      const err = await listResponse.text();
      return res.status(500).json({ error: err });
    }

    const files = await listResponse.json();

    if (!files || files.length === 0) {
      return res.status(200).json({
        success: true,
        deleted: 0,
        message: "Bucket vazio"
      });
    }

    const paths = files.map(file => file.name);

    /* ===========================
       DELETA TODOS OS ARQUIVOS
    ============================ */
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}`,
      {
        method: "DELETE",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ paths })
      }
    );

    if (!deleteResponse.ok) {
      const err = await deleteResponse.text();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({
      success: true,
      deleted: paths.length
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}