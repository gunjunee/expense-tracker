//Category Chart
const CATEGORIES = [
  "materials", "labour", "transport",
  "miscellaneous", "contingency", "other",
];

const COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b",
  "#a855f7", "#ef4444", "#64748b",
];

let chart = null;

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function drawChart(canvas, labels, data, colors) {
  if (chart) {
    chart.destroy();
    chart = null;
  }

  chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 2, borderColor: "#ffffff" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { padding: 15, usePointStyle: true } },
      },
    },
  });
}

export function updateChart(canvas, expenses, selectedCategory = "") {
  if (typeof Chart === "undefined") {
    console.warn("Chart.js library is not loaded.");
    return;
  }

  const totals = {};
  CATEGORIES.forEach((c) => (totals[c] = 0));

  expenses.forEach((e) => {
    if (totals[e.category] !== undefined) {
      totals[e.category] += Number(e.amount) + Number(e.gstAmount || 0);
    }
  });

  if (selectedCategory) {
    const i = CATEGORIES.indexOf(selectedCategory);
    drawChart(
      canvas,
      [capitalize(selectedCategory)],
      [totals[selectedCategory]],
      [COLORS[i]]
    );
    return;
  }

  drawChart(canvas, CATEGORIES.map(capitalize), CATEGORIES.map((c) => totals[c]), COLORS);
}