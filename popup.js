const intervalInput = document.getElementById("interval");
const unitInput = document.getElementById("unit");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

function getIntervalMs() {
  const value = Number(intervalInput.value);
  if (!Number.isFinite(value) || value < 1) return null;
  return unitInput.value === "minutes" ? value * 60 * 1000 : value * 1000;
}

function renderStatus(active, intervalMs) {
  statusEl.textContent = active
    ? `Status: Aktif (${intervalMs / 1000}s)`
    : "Status: Tidak aktif";
  startBtn.disabled = active;
  stopBtn.disabled = !active;
}

async function loadSettings() {
  const data = await chrome.storage.local.get({
    interval: 10,
    unit: "seconds",
    active: false,
    intervalMs: 10000
  });
  intervalInput.value = data.interval;
  unitInput.value = data.unit;
  renderStatus(data.active, data.intervalMs);
}

async function saveSettings() {
  await chrome.storage.local.set({
    interval: Number(intervalInput.value),
    unit: unitInput.value,
  });
}

startBtn.addEventListener("click", async () => {
  const intervalMs = getIntervalMs();
  if (!intervalMs) {
    statusEl.textContent = "Masukkan interval minimal 1.";
    return;
  }
  await saveSettings();
  await chrome.storage.local.set({ active: true, intervalMs });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.sendMessage(tab.id, {
      type: "START_AUTO_REFRESH",
      intervalMs,
      }).catch(() => {});
  }
  renderStatus(true, intervalMs);
});

stopBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({ active: false });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.sendMessage(tab.id, { type: "STOP_AUTO_REFRESH" }).catch(() => {});
  }
  renderStatus(false, 0);
});

[intervalInput, unitInput].forEach(el => {
  el.addEventListener("change", saveSettings);
});

loadSettings();