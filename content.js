const ALERT_COLOR = "rgb(196, 22, 42)";
const NORMAL_COLOR = "rgb(115, 191, 105)";

function getWidgetByTitle(title) {
  return [...document.querySelectorAll('[data-viz-panel-key]')]
    .find(el => el.textContent.includes(title));
}

function getValueElement(panel) {
  return panel?.querySelector('span');
}

function evaluatePanel(title, condition) {

    const panel = getWidgetByTitle(title);

    if (!panel) return;

    const spans = panel.querySelectorAll("span");

    let targetSpan = null;

    spans.forEach(span => {
        const value = parseInt(span.textContent.trim());

        if (!isNaN(value)) {
            targetSpan = span;
        }
    });

    if (!targetSpan) return;

    const value = parseInt(targetSpan.textContent.trim());

    // Cari DIV yang memiliki style color
    const colorContainer = targetSpan.closest("div")?.parentElement;

    if (!colorContainer) return;

    if (condition(value)) {
        colorContainer.style.color = "rgb(196, 22, 42)";
    } else {
        colorContainer.style.color = "rgb(115, 191, 105)";
    }
}

function checkPanels() {

  // Calls Waiting > 1
//   evaluatePanel("Calls Waiting", value => value > 1);

  // Abandon > 1
//   evaluatePanel("Abandon", value => value > 1);

  // Agent Online < 3
  evaluatePanel("Agent Online", value => value < 3);

  // Ready < 3
  evaluatePanel("Ready", value => value < 3);
}

setInterval(checkPanels, 2000);

const observer = new MutationObserver(() => {
  checkPanels();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

checkPanels();