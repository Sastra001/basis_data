// ═══════════════════════════════════════════
// CHART.JS — Semua logika grafik/visualisasi
// Menggunakan Chart.js (CDN)
// ═══════════════════════════════════════════

let chartInstance    = null;
let chartInstanceF1  = null;

/**
 * Render 5 mini line charts untuk sidebar daftar C1-C5.
 * @param {string} asset - 'bitcoin' atau 'forex'
 */
function drawSidebarCharts(asset) {
  const allYears = DATASET.meta.years;

  // Ambil nilai C1-C5 untuk setiap tahun
  const c1Data = allYears.map(y => DATASET.bessonRank[y].c1.nilai);
  const c2Data = allYears.map(y => DATASET.bessonRank[y].c2.nilai);
  const c3Data = allYears.map(y => DATASET.bessonRank[y].c3.nilai);
  const c4Data = allYears.map(y => DATASET.bessonRank[y].c4.nilai);
  const c5Data = allYears.map(y => DATASET.bessonRank[y].c5.nilai);

  const kriteria = [
    { label: 'Pertumbuhan (C1)', data: c1Data, color: KRITERIA_COLORS.c1 },
    { label: 'Penurunan (C2)', data: c2Data, color: KRITERIA_COLORS.c2 },
    { label: 'Komunitas (C3)', data: c3Data, color: KRITERIA_COLORS.c3 },
    { label: 'Popularitas (C4)', data: c4Data, color: KRITERIA_COLORS.c4 },
    { label: 'Kerugian (C5)', data: c5Data, color: KRITERIA_COLORS.c5 }
  ];

  const html = kriteria.map((k, idx) => `
    <div class="sidebar-item">
      <div class="sidebar-item-label" style="color:${k.color}">● ${k.label}</div>
      <div class="sidebar-item-value">${k.data[k.data.length - 1].toFixed(1)}</div>
      <div class="sidebar-chart-wrap">
        <canvas id="sidebar-chart-${idx}"></canvas>
      </div>
    </div>
  `).join('');

  document.getElementById('f1-sidebar-items').innerHTML = html;

  // Draw masing-masing mini chart
  kriteria.forEach((k, idx) => {
    const ctx = document.getElementById(`sidebar-chart-${idx}`);
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: allYears,
          datasets: [{
            label: k.label,
            data: k.data,
            borderColor: k.color,
            backgroundColor: k.color + '22',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
  });
}
function drawLineChartFitur1(asset, growthData, indicators = {}) {
  if (chartInstanceF1) chartInstanceF1.destroy();

  const allYears = DATASET.meta.years;

  // Dataset utama (line hijau)
  const datasets = [{
    label: asset === 'bitcoin' ? 'Bitcoin (BTC)' : 'Forex',
    data: growthData,
    borderColor: '#10B981',
    backgroundColor: '#10B98122',
    borderWidth: 2.5,
    pointRadius: 4,
    pointBackgroundColor: '#10B981',
    pointBorderColor: '#fff',
    pointBorderWidth: 1.5,
    tension: 0.4,
    fill: true,
    yAxisID: 'y'
  }];

  // Tambah MA jika enabled
  if (indicators.ma) {
    datasets.push({
      label: `MA ${indicators.ma.length}`,
      data: indicators.ma,
      borderColor: '#F59E0B',
      borderWidth: 1.5,
      pointRadius: 0,
      borderDash: [5, 5],
      fill: false,
      yAxisID: 'y',
      tension: 0.2
    });
  }

  // Tambah MACD jika enabled
  if (indicators.macd) {
    datasets.push({
      label: 'MACD Line',
      data: indicators.macd.macdLine,
      borderColor: '#3B82F6',
      borderWidth: 1,
      pointRadius: 0,
      fill: false,
      yAxisID: 'y2',
      tension: 0.2
    });

    datasets.push({
      label: 'MACD Signal',
      data: indicators.macd.signalLine,
      borderColor: '#EF4444',
      borderWidth: 1,
      pointRadius: 0,
      borderDash: [3, 3],
      fill: false,
      yAxisID: 'y2',
      tension: 0.2
    });

    // Histogram sebagai bar
    datasets.push({
      label: 'MACD Histogram',
      type: 'bar',
      data: indicators.macd.histogram,
      backgroundColor: indicators.macd.histogram.map(v =>
        v === null ? 'transparent' : (v >= 0 ? '#10B98155' : '#EF444455')
      ),
      borderWidth: 0,
      yAxisID: 'y2'
    });
  }

  // Tambah Envelope jika enabled
  if (indicators.envelope) {
    datasets.push({
      label: `Envelope Upper ${indicators.envelope.upperBand.length}`,
      data: indicators.envelope.upperBand,
      borderColor: '#8B5CF6',
      borderWidth: 0.8,
      pointRadius: 0,
      borderDash: [2, 2],
      fill: false,
      yAxisID: 'y',
      tension: 0.2
    });

    datasets.push({
      label: `Envelope Lower ${indicators.envelope.lowerBand.length}`,
      data: indicators.envelope.lowerBand,
      borderColor: '#8B5CF6',
      borderWidth: 0.8,
      pointRadius: 0,
      borderDash: [2, 2],
      fill: false,
      yAxisID: 'y',
      tension: 0.2
    });
  }

  const ctx = document.getElementById('f1-chart').getContext('2d');
  chartInstanceF1 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allYears,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { font: { size: 11 }, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              if (val === null) return '';
              return ` ${ctx.dataset.label}: ${val >= 0 ? '+' : ''}${val.toFixed(4)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f0f0f0' },
          ticks: { font: { size: 10 }, color: '#888' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { size: 10 },
            color: '#888',
            callback: v => v + '%'
          },
          title: {
            display: true,
            text: 'Pertumbuhan (%)',
            color: '#aaa',
            font: { size: 10 }
          }
        },
        y2: {
          type: 'linear',
          display: indicators.macd ? true : false,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            font: { size: 10 },
            color: '#888'
          },
          title: {
            display: true,
            text: 'MACD',
            color: '#aaa',
            font: { size: 10 }
          }
        }
      }
    }
  });
}

/**
 * Render line chart pertumbuhan untuk semua item yang dipilih (fitur 2).
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
