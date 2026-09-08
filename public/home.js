(async function () {
  const grid = document.getElementById("moduleGrid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/modules`);
    if (!res.ok) throw new Error("خطا در دریافت ماژول‌ها");
    const modules = await res.json();

    grid.innerHTML = "";

    modules.forEach((mod, i) => {
      const card = document.createElement("a");
      card.className = "module-card";
      card.href = mod.dashboard ? "manage.html" : `module.html?m=${mod.slug}`;

      card.innerHTML = `
        <div class="module-top">
          <span class="module-code">${String(i + 1).padStart(2, "0")}</span>
          <span class="module-key">${mod.title}</span>
        </div>
        <p class="module-desc">${mod.desc}</p>
        <span class="module-link">${mod.dashboard ? "مشاهده داشبورد" : "ورود به ماژول"} ←</span>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="loading-note error">
      اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند با دستور <code>npm start</code> در پوشه backend اجرا شده است.
    </p>`;
  }
})();
