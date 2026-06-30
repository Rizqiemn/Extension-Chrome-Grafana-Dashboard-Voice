const ALERT_COLOR = "rgb(196, 22, 42)";
const NORMAL_COLOR = "rgb(115, 191, 105)";
const White_COLOR = "#C7C7D7";

/**
 * Cari panel berdasarkan judul
 */
function getWidgetByTitle(title) {

    return [...document.querySelectorAll('[data-viz-panel-key]')]
        .find(panel => {

            const lines = panel.innerText
                .split('\n')
                .map(x => x.trim())
                .filter(Boolean);

            return lines[0] === title;

        });
}


/**
 * Ganti nama agent
 */
function renameAgent() {

    document
        .querySelectorAll('div[role="row"]')
        .forEach(row => {

            const cells = row.querySelectorAll('div[role="cell"]');

            if (cells.length < 2) return;

            const nameCell = cells[1];

            if (nameCell.textContent.trim() === "Lulu Ilmaknunah") {
                nameCell.textContent = "Apnur Dwi Ningsih";
            }

        });

}


/**
 * Ubah warna panel stat
 */
function evaluatePanel(title, condition) {

    const panel = getWidgetByTitle(title);

    if (!panel) return;

    const valueSpan = [...panel.querySelectorAll("span")]
        .find(span => !isNaN(parseInt(span.textContent.trim())));

    if (!valueSpan) return;

    const value = parseInt(valueSpan.textContent.trim());

    if (isNaN(value)) return;

    const valueContainer =
        valueSpan.parentElement?.parentElement;

    if (!valueContainer) return;

    valueContainer.style.setProperty(
        "color",
        condition(value)
            ? ALERT_COLOR
            : NORMAL_COLOR,
        "important"
    );
}

/**
 * Ubah warna legend donut Abandon
 */
function updateAbandonDonut() {

    document
        .querySelectorAll("button[title='Abandon']")
        .forEach(btn => {

            const row = btn.closest("tr");

            if (!row) return;

            const valueCell =
                row.querySelector("td.css-s2uf1z");

            if (!valueCell) return;

            const value =
                parseInt(valueCell.textContent.trim()) || 0;

            const icon =
                row.querySelector(
                    '[data-testid="series-icon"]'
                );

            if (value > 0) {

                valueCell.style.setProperty(
                    "color",
                    White_COLOR,
                    "important"
                );

                btn.style.setProperty(
                    "color",
                    White_COLOR,
                    "important"
                );

                if (icon) {
                    icon.style.setProperty(
                        "background",
                        NORMAL_COLOR,
                        "important"
                    );
                }

            } else {

                valueCell.style.setProperty(
                    "color",
                    White_COLOR,
                    "important"
                );

                btn.style.setProperty(
                    "color",
                    White_COLOR,
                    "important"
                );

                if (icon) {
                    icon.style.setProperty(
                        "background",
                        NORMAL_COLOR,
                        "important"
                    );
                }
            }

        });
}


/**
 * Warna status agent
 */
function colorAgentStatusTable() {

    document
        .querySelectorAll('div[role="row"]')
        .forEach(row => {

            const cells = row.querySelectorAll(
                'div[role="cell"]'
            );

            if (cells.length < 3) return;

            const statusCell = cells[2];

            const status =
                statusCell.textContent.trim().toUpperCase();

            // READY
            if (status.includes("READY")) {

                statusCell.style.setProperty(
                    "color",
                    "rgb(115,191,105)",
                    "important"
                );

            }

            // TALKING
            else if (status.includes("TALKING")) {

                statusCell.style.setProperty(
                    "color",
                    "rgb(242,204,12)",
                    "important"
                );

            }

            // TALKING
            else if (status.includes("ON HOLD")) {

                statusCell.style.setProperty(
                    "color",
                    "rgb(242, 12, 204)",
                    "important"
                );

            }

            // AUX
            else if (status.includes("AUX")) {

                statusCell.style.setProperty(
                    "color",
                    "rgb(255,140,0)",
                    "important"
                );

            }

            // UNAVAILABLE
            else if (status.includes("UNAVAILABLE")) {

                statusCell.style.setProperty(
                    "color",
                    "rgb(255,255,255)",
                    "important"
                );

            }

        });

}


function checkPanels() {

    // Calls Waiting > 1
    evaluatePanel(
        "Calls Waiting",
        value => value > 1
    );

    // Abandon > 0
    evaluatePanel(
        "Abandon",
        value => value > 0
    );

    // Agent Online < 3
    evaluatePanel(
        "Agent Online",
        value => value < 3
    );

    // Ready < 3
    evaluatePanel(
        "Ready",
        value => value < 3
    );

    // Donut Chart
    updateAbandonDonut();

    // Agent Status Table
    colorAgentStatusTable();
    renameAgent();
}

// Initial
checkPanels();

// Realtime
setInterval(checkPanels, 1000);

// Monitor perubahan Grafana
new MutationObserver(() => {
    checkPanels();
}).observe(document.body, {
    childList: true,
    subtree: true
});