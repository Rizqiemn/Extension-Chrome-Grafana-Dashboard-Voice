(function () {
  const TARGET_COLUMN = "status";
  let lastSortTime = 0;
  const COOLDOWN = 4000; // minimal 8 detik sekali sort

  function findStatusHeader() {
    const buttons = document.querySelectorAll('button[title="Toggle SortBy"]');
    for (const btn of buttons) {
      if (btn.textContent?.trim().toLowerCase() === TARGET_COLUMN) {
        return btn;
      }
    }
    return null;
  }

  function isAlreadySortedAsc(headerBtn) {
    const path = headerBtn.querySelector("svg path");
    if (!path) return false;
    const d = path.getAttribute("d") || "";
    // path panah naik (ascending)
    return d.includes("M17.71,11.29l-5-5") || d.includes("l-5-5a1");
  }

  function trySort() {
    const now = Date.now();
    if (now - lastSortTime < COOLDOWN) return;

    const header = findStatusHeader();
    if (!header) return;

    if (isAlreadySortedAsc(header)) return;

    header.click();
    lastSortTime = now;
    console.log("[AutoSort] Sorted status ascending");
  }

  // Cuma jalan sekali saat halaman load
  setTimeout(trySort, 2000);

  // Cek lagi setelah data refresh (Grafana refresh 30s)
  setInterval(trySort, 15000); // 15 detik sekali cukup
})();
