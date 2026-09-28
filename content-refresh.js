(() => {
  let timerId = null;
  let labelTimerId = null;
  let originalLabel = null;

  function findRefreshButton() {
    return (
      document.querySelector('button[data-testid="data-testid RefreshPicker run button"]') ||
      document.querySelector('button[aria-label="Refresh"]')
    );
  }

  function clickRefresh() {
    const btn = findRefreshButton();
    // Kalau tombol tidak ada (halaman lain / sedang loading), lewati saja, jangan reload halaman
    if (!btn || btn.disabled) return;
    btn.click();
  }

  // ---- Label interval Grafana (mis. "30s") disamakan dengan interval extension ----
  function formatInterval(ms) {
    const sec = Math.round(ms / 1000);
    if (sec >= 60 && sec % 60 === 0) return `${sec / 60}m`;
    return `${sec}s`;
  }

  function getLabelTextNode() {
    const btn = document.querySelector(
      'button[data-testid="data-testid RefreshPicker interval button"]'
    );
    const div = btn && btn.querySelector("div");
    return div && div.firstChild && div.firstChild.nodeType === 3 ? div.firstChild : null;
  }

  function applyLabel(text) {
    const node = getLabelTextNode();
    if (!node) return;
    if (originalLabel === null && node.nodeValue !== text) originalLabel = node.nodeValue;
    // Ubah nodeValue (bukan ganti elemen) supaya tidak merusak render React milik Grafana
    if (node.nodeValue !== text) node.nodeValue = text;
  }

  function startLabel(intervalMs) {
    stopLabel(false);
    const text = formatInterval(intervalMs);
    applyLabel(text);
    // Grafana bisa menimpa teks saat re-render, jadi diterapkan ulang tiap 1 detik
    labelTimerId = setInterval(() => applyLabel(text), 1000);
  }

  function stopLabel(restore = true) {
    if (labelTimerId !== null) {
      clearInterval(labelTimerId);
      labelTimerId = null;
    }
    if (restore && originalLabel !== null) {
      const node = getLabelTextNode();
      if (node) node.nodeValue = originalLabel;
      originalLabel = null;
    }
  }

  function stop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    stopLabel(true);
  }

  function start(intervalMs) {
    stop();
    timerId = setInterval(clickRefresh, intervalMs);
    startLabel(intervalMs);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "START_AUTO_REFRESH") {
      start(message.intervalMs);
    } else if (message.type === "STOP_AUTO_REFRESH") {
      stop();
    }
  });

  chrome.storage.local.get({
    active: false,
    intervalMs: 10000,
  }).then((data) => {
    if (data.active) start(data.intervalMs);
  });
})();
