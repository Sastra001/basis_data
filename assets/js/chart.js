// ═══════════════════════════════════════════
// CHART.JS — Semua logika grafik/visualisasi
// Menggunakan Chart.js (CDN)
// ═══════════════════════════════════════════

let chartInstance = null;

/**
 * Render line chart pertumbuhan untuk semua item yang dipilih.
 * @param {Array} items - Array item dari getItems() di fitur2.js
 */
function drawLineChart(items) {
  if (chartInstance) chartInstance.destroy();

  const allYears = DATASET.meta.years;

  const datasets = items.map(item => ({
    label: item.label,
    data: allYears.map(y => {
      const g = DATASET.alternative[y][item.asset];
      return parseFloat((g * 100).toFixed(4));
    }),
    borderColor: item.color,
    backgroundColor: item.color + '22',
    borderWidth: 2,
    pointRadius: allYears.map(y => y === item.year ? 6 : 3),
    pointBackgroundColor: allYears.map(y => y === item.year ? item.color : '#fff'),
    pointBorderColor: item.color,
    pointBorderWidth: allYears.map(y => y === item.year ? 3 : 1.5),
    tension: 0.3,
    fill: false
  }));

  const ctx = document.getElementById('f2-chart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels: allYears, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}%`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 11 }, color: '#888' }
        },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { size: 11 },
            color: '#888',
            callback: v => v + '%'
          },
          title: {
            display: true,
            text: 'Pertumbuhan (%)',
            color: '#aaa',
            font: { size: 11 }
          }
        }
      }
    }
  });

  // Render legend manual di bawah chart
  document.getElementById('f2-legend').innerHTML = items.map(item => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${item.color}"></div>
      <span>${item.label}</span>
      <span style="color:#aaa;font-size:11px">(titik tebal = tahun dipilih)</span>
    </div>`
  ).join('');
}

/**
 * Hapus chart yang sedang aktif.
 * Dipanggil saat reset items di fitur2.
 */
function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}
