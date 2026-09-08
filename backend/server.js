const path = require("path");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { MODULES } = require("./modules.config");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------- کمک‌تابع‌ها ----------

function getModuleConfig(slug) {
  return MODULES[slug];
}

function validatePayload(slug, payload) {
  const config = getModuleConfig(slug);
  const errors = [];
  const clean = {};

  for (const field of config.fields) {
    let value = payload[field.key];

    if (field.required && (value === undefined || value === null || String(value).trim() === "")) {
      errors.push(`فیلد «${field.label}» الزامی است.`);
      continue;
    }

    if (value === undefined || value === null) {
      value = "";
    }

    if (field.type === "number" && value !== "") {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors.push(`فیلد «${field.label}» باید عددی باشد.`);
      } else {
        value = num;
      }
    }

    if (field.type === "select" && value !== "" && field.options && !field.options.includes(value)) {
      errors.push(`مقدار فیلد «${field.label}» معتبر نیست.`);
    }

    clean[field.key] = value;
  }

  return { errors, clean };
}

function serializeRow(row) {
  return {
    id: row.id,
    module: row.module,
    ...JSON.parse(row.data),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// ---------- میان‌افزار بررسی وجود ماژول ----------

app.param("module", (req, res, next, slug) => {
  const config = getModuleConfig(slug);
  if (!config) {
    return res.status(404).json({ error: `ماژول «${slug}» یافت نشد.` });
  }
  if (config.dashboard) {
    return res.status(400).json({ error: "این ماژول یک داشبورد است و رکورد مستقیم ندارد." });
  }
  req.moduleSlug = slug;
  req.moduleConfig = config;
  next();
});

// ---------- مسیرهای عمومی ----------

app.get("/api/modules", (req, res) => {
  const list = Object.entries(MODULES).map(([slug, cfg]) => ({
    slug,
    title: cfg.title,
    label: cfg.label,
    desc: cfg.desc,
    dashboard: !!cfg.dashboard,
    fields: cfg.fields
  }));
  res.json(list);
});

app.get("/api/modules/:module", (req, res) => {
  res.json({ slug: req.moduleSlug, ...req.moduleConfig });
});

// ---------- داشبورد AralManage: خلاصه KPI از همه ماژول‌ها ----------
// این مسیر باید قبل از مسیرهای عمومی /api/:module/:id تعریف شود تا با آن تداخل نکند.

app.get("/api/manage/summary", (req, res) => {
  const summary = {};
  for (const slug of Object.keys(MODULES)) {
    if (MODULES[slug].dashboard) continue;
    const count = db.prepare("SELECT COUNT(*) AS c FROM records WHERE module = ?").get(slug).c;
    summary[slug] = { count, title: MODULES[slug].title, label: MODULES[slug].label };
  }

  const productionRows = db.prepare("SELECT data FROM records WHERE module = 'production'").all();
  const totalOutput = productionRows.reduce((sum, r) => sum + (JSON.parse(r.data).output_qty || 0), 0);

  const qualityRows = db.prepare("SELECT data FROM records WHERE module = 'quality'").all();
  const passCount = qualityRows.filter((r) => JSON.parse(r.data).result === "قبول").length;
  const qualityRate = qualityRows.length ? Math.round((passCount / qualityRows.length) * 100) : null;

  const supplyRows = db.prepare("SELECT data FROM records WHERE module = 'supply'").all();
  const criticalSupply = supplyRows.filter((r) => JSON.parse(r.data).status === "بحرانی").length;

  const serviceRows = db.prepare("SELECT data FROM records WHERE module = 'service'").all();
  const openTickets = serviceRows.filter((r) => JSON.parse(r.data).status !== "بسته‌شده").length;

  res.json({
    counts: summary,
    kpis: { totalOutput, qualityRate, criticalSupply, openTickets }
  });
});

// ---------- CRUD عمومی برای هر ماژول ----------

app.get("/api/:module", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM records WHERE module = ? ORDER BY id DESC")
    .all(req.moduleSlug);
  res.json(rows.map(serializeRow));
});

app.get("/api/:module/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM records WHERE module = ? AND id = ?")
    .get(req.moduleSlug, req.params.id);
  if (!row) return res.status(404).json({ error: "رکورد یافت نشد." });
  res.json(serializeRow(row));
});

app.post("/api/:module", (req, res) => {
  const { errors, clean } = validatePayload(req.moduleSlug, req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  const info = db
    .prepare("INSERT INTO records (module, data) VALUES (?, ?)")
    .run(req.moduleSlug, JSON.stringify(clean));

  const row = db.prepare("SELECT * FROM records WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(serializeRow(row));
});

app.put("/api/:module/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM records WHERE module = ? AND id = ?")
    .get(req.moduleSlug, req.params.id);
  if (!existing) return res.status(404).json({ error: "رکورد یافت نشد." });

  const { errors, clean } = validatePayload(req.moduleSlug, req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  db.prepare("UPDATE records SET data = ?, updated_at = datetime('now') WHERE id = ?").run(
    JSON.stringify(clean),
    req.params.id
  );

  const row = db.prepare("SELECT * FROM records WHERE id = ?").get(req.params.id);
  res.json(serializeRow(row));
});

app.delete("/api/:module/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM records WHERE module = ? AND id = ?")
    .get(req.moduleSlug, req.params.id);
  if (!existing) return res.status(404).json({ error: "رکورد یافت نشد." });

  db.prepare("DELETE FROM records WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---------- سرو فرانت‌اند استاتیک ----------

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`AralOne backend روی پورت ${PORT} در حال اجراست`);
});
