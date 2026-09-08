(function () {
  const grid = document.getElementById("moduleGrid");
  if (!grid || typeof ARAL_MODULES === "undefined") return;

  ARAL_MODULES.forEach((mod) => {
    const card = document.createElement("article");
    card.className = "module-card";
    card.innerHTML = `
      <div class="module-top">
        <span class="module-code">${mod.code}</span>
        <span class="module-key">${mod.key}</span>
      </div>
      <p class="module-desc">${mod.desc}</p>
    `;
    grid.appendChild(card);
  });
})();
