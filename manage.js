(async function () {
  const kpiGrid = document.getElementById("kpiGrid");
  const countGrid = document.getElementById("countGrid");

  try {
    const res = await fetch(`${API_BASE}/manage/summary`);
    if (!res.ok) throw new Error("خطا در دریافت خلاصه");
    const { counts, kpis } = await res.json();

    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-num">${kpis.totalOutput.toLocaleString("fa-IR")}</div>
        <div class="kpi-label">مجموع تیراژ تولید ثبت‌شده</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num">${kpis.qualityRate === null ? "—" : kpis.qualityRate + "%"}</div>
        <div class="kpi-label">نرخ قبولی کیفیت</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num">${kpis.criticalSupply}</div>
        <div class="kpi-label">اقلام انبار در وضعیت بحرانی</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-num">${kpis.openTickets}</div>
        <div class="kpi-label">تیکت‌های باز خدمات پس از فروش</div>
      </div>
    `;

    countGrid.innerHTML = "";
    Object.entries(counts).forEach(([slug, info], i) => {
      const card = document.createElement("a");
      card.className = "module-card";
      card.href = `module.html?m=${slug}`;
      card.innerHTML = `
        <div class="module-top">
          <span class="module-code">${String(i + 1).padStart(2, "0")}</span>
          <span class="module-key">${info.title}</span>
        </div>
        <p class="module-desc">${info.label}</p>
        <span class="module-link">${info.count} رکورد ←</span>
      `;
      countGrid.appendChild(card);
    });
  } catch (err) {
    kpiGrid.innerHTML = `<p class="loading-note error">
      اتصال به سرور برقرار نشد. مطمئن شوید بک‌اند با دستور <code>npm start</code> در پوشه backend اجرا شده است.
    </p>`;
  }
})();
