(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("m");

  const tableWrap = document.getElementById("tableWrap");
  const moduleTitle = document.getElementById("moduleTitle");
  const moduleDesc = document.getElementById("moduleDesc");
  const moduleCode = document.getElementById("moduleCode");
  const pageTitle = document.getElementById("pageTitle");
  const recordCountLabel = document.getElementById("recordCountLabel");

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalTitle = document.getElementById("modalTitle");
  const modalErrors = document.getElementById("modalErrors");
  const recordForm = document.getElementById("recordForm");
  const openAddBtn = document.getElementById("openAddBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  let moduleConfig = null;
  let editingId = null;

  if (!slug) {
    tableWrap.innerHTML = `<p class="loading-note error">ماژولی مشخص نشده. از صفحه اصلی وارد شوید.</p>`;
    return;
  }

  async function init() {
    try {
      const cfgRes = await fetch(`${API_BASE}/modules/${slug}`);
      if (!cfgRes.ok) throw new Error("ماژول یافت نشد");
      moduleConfig = await cfgRes.json();

      moduleTitle.textContent = moduleConfig.title;
      moduleDesc.textContent = moduleConfig.desc;
      moduleCode.textContent = moduleConfig.label;
      pageTitle.textContent = `${moduleConfig.title} | AralOne`;

      buildForm();
      await loadRecords();
    } catch (err) {
      tableWrap.innerHTML = `<p class="loading-note error">
        اتصال به سرور برقرار نشد یا ماژول نامعتبر است. مطمئن شوید بک‌اند اجرا شده است.
      </p>`;
    }
  }

  function buildForm() {
    recordForm.innerHTML = "";
    moduleConfig.fields.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "field-group";

      const label = document.createElement("label");
      label.textContent = field.label + (field.required ? " *" : "");
      label.setAttribute("for", `f_${field.key}`);
      wrap.appendChild(label);

      let input;
      if (field.type === "select") {
        input = document.createElement("select");
        input.innerHTML =
          `<option value="">انتخاب کنید</option>` +
          field.options.map((o) => `<option value="${o}">${o}</option>`).join("");
      } else if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 3;
      } else {
        input = document.createElement("input");
        input.type = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
      }
      input.id = `f_${field.key}`;
      input.name = field.key;
      wrap.appendChild(input);
      recordForm.appendChild(wrap);
    });
  }

  async function loadRecords() {
    const res = await fetch(`${API_BASE}/${slug}`);
    const records = await res.json();
    recordCountLabel.textContent = `رکوردها (${records.length})`;
    renderTable(records);
  }

  function renderTable(records) {
    if (!records.length) {
      tableWrap.innerHTML = `<p class="loading-note">هنوز رکوردی ثبت نشده. با دکمه «افزودن رکورد» شروع کنید.</p>`;
      return;
    }

    const fields = moduleConfig.fields;
    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    thead.innerHTML =
      "<tr>" +
      fields.map((f) => `<th>${f.label}</th>`).join("") +
      "<th>ثبت</th><th></th></tr>";
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    records.forEach((rec) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        fields.map((f) => `<td>${escapeHtml(rec[f.key] ?? "")}</td>`).join("") +
        `<td class="cell-dim">${formatDate(rec.created_at)}</td>` +
        `<td class="row-actions">
           <button class="btn-icon" data-action="edit" data-id="${rec.id}">ویرایش</button>
           <button class="btn-icon danger" data-action="delete" data-id="${rec.id}">حذف</button>
         </td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableWrap.innerHTML = "";
    tableWrap.appendChild(table);

    tableWrap.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener("click", () => openEdit(btn.dataset.id, records));
    });
    tableWrap.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () => deleteRecord(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    return iso.replace("T", " ").slice(0, 16);
  }

  function openModal() {
    modalBackdrop.classList.add("open");
  }
  function closeModal() {
    modalBackdrop.classList.remove("open");
    modalErrors.innerHTML = "";
    editingId = null;
    recordForm.reset();
  }

  function openAdd() {
    editingId = null;
    modalTitle.textContent = `افزودن رکورد — ${moduleConfig.title}`;
    recordForm.reset();
    openModal();
  }

  function openEdit(id, records) {
    const rec = records.find((r) => String(r.id) === String(id));
    if (!rec) return;
    editingId = id;
    modalTitle.textContent = `ویرایش رکورد — ${moduleConfig.title}`;
    moduleConfig.fields.forEach((f) => {
      const input = document.getElementById(`f_${f.key}`);
      if (input) input.value = rec[f.key] ?? "";
    });
    openModal();
  }

  async function deleteRecord(id) {
    if (!confirm("این رکورد حذف شود؟")) return;
    await fetch(`${API_BASE}/${slug}/${id}`, { method: "DELETE" });
    await loadRecords();
  }

  recordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    modalErrors.innerHTML = "";

    const payload = {};
    moduleConfig.fields.forEach((f) => {
      const input = document.getElementById(`f_${f.key}`);
      payload[f.key] = input.value;
    });

    const url = editingId ? `${API_BASE}/${slug}/${editingId}` : `${API_BASE}/${slug}`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      modalErrors.innerHTML = (data.errors || [data.error])
        .map((e) => `<div class="form-error">${e}</div>`)
        .join("");
      return;
    }

    closeModal();
    await loadRecords();
  });

  openAddBtn.addEventListener("click", openAdd);
  cancelBtn.addEventListener("click", closeModal);
  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  init();
})();
