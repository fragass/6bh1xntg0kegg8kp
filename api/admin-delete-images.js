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
  const BUCKET = "chat-images";

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json"
  };

  // 🔁 função recursiva para listar tudo
  async function listAll(prefix = "") {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          prefix,
          limit: 1000
        })
      }
    );

    const items = await res.json();
    let files = [];

    for (const item of items) {
      if (item.metadata) {
        // é arquivo
        files.push(prefix + item.name);
      } else {
        // é pasta → entra nela
        const subFiles = await listAll(prefix + item.name + "/");
        files = files.concat(subFiles);
      }
    }

    return files;
  }

  try {
    const allFiles = await listAll();

    if (allFiles.length === 0) {
      return res.status(200).json({ success: true, deleted: 0 });
    }

    const deleteRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({
          prefixes: allFiles
        })
      }
    );

    if (!deleteRes.ok) {
      const error = await deleteRes.text();
      return res.status(500).json({ error });
    }

    return res.status(200).json({
      success: true,
      deleted: allFiles.length
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
