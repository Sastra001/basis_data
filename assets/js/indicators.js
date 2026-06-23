// ═══════════════════════════════════════════
// INDICATORS.JS — Kalkulasi MA, MACD, Envelope
// ═══════════════════════════════════════════

/**
 * Hitung Simple Moving Average (SMA)
 * @param {Array} data - array nilai (growth per tahun)
 * @param {number} period - periode MA
 * @returns {Array} array MA dengan panjang sama seperti input
 */
function calculateSMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const subset = data.slice(i - period + 1, i + 1);
    return subset.reduce((a, b) => a + b, 0) / period;
  });
}

/**
 * Hitung Exponential Moving Average (EMA)
 * @param {Array} data
 * @param {number} period
 * @returns {Array} array EMA
 */
function calculateEMA(data, period) {
  const multiplier = 2 / (period + 1);
  const ema = [];

  // Mulai dari SMA sebagai nilai awal
  let smaSum = 0;
  for (let i = 0; i < period; i++) {
    if (data[i] !== null) smaSum += data[i];
  }
  ema[period - 1] = smaSum / period;

  // Hitung EMA untuk data selanjutnya
  for (let i = period; i < data.length; i++) {
    if (data[i] === null || ema[i - 1] === undefined) {
      ema[i] = null;
    } else {
      ema[i] = (data[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    }
  }

  // Isi nilai sebelum periode dengan null
  for (let i = 0; i < period - 1; i++) {
    ema[i] = null;
  }

  return ema;
}

/**
 * Hitung MACD (Moving Average Convergence Divergence)
 * @param {Array} data - array nilai pertumbuhan
 * @param {number} fast - periode cepat (default 12)
 * @param {number} slow - periode lambat (default 26)
 * @param {number} signal - periode sinyal (default 9)
 * @returns {Object} { macdLine, signalLine, histogram }
 */
function calculateMACD(data, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);

  // MACD Line = EMA 12 - EMA 26
  const macdLine = emaFast.map((val, i) => {
    if (val === null || emaSlow[i] === null) return null;
    return val - emaSlow[i];
  });

  // Signal Line = EMA dari MACD Line
  const signalLine = calculateEMA(macdLine, signal);

  // Histogram = MACD - Signal
  const histogram = macdLine.map((val, i) => {
    if (val === null || signalLine[i] === null) return null;
    return val - signalLine[i];
  });

  return { macdLine, signalLine, histogram };
}

/**
 * Hitung Bollinger Bands (Envelope)
 * @param {Array} data - array nilai pertumbuhan
 * @param {number} period - periode MA (default 20)
 * @param {number} percentage - persentase standar deviasi (default 2, artinya 2%)
 * @returns {Object} { ma, upperBand, lowerBand }
 */
function calculateBollingerBands(data, period = 20, percentage = 2) {
  const ma = calculateSMA(data, period);

  const upperBand = ma.map((avgVal, i) => {
    if (avgVal === null) return null;
    if (i < period - 1) return null;

    // Hitung standar deviasi dari data dalam periode
    const subset = data.slice(i - period + 1, i + 1);
    const mean = subset.reduce((a, b) => a + b, 0) / period;
    const variance = subset.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    // Upper = MA + (percentage/100 * MA) tapi biasanya pakai stdDev
    // Untuk kasus ini: Upper = MA + (percentage/100) * MA
    return avgVal + (avgVal * percentage / 100);
  });

  const lowerBand = ma.map((avgVal, i) => {
    if (avgVal === null) return null;
    if (i < period - 1) return null;

    const subset = data.slice(i - period + 1, i + 1);
    const mean = subset.reduce((a, b) => a + b, 0) / period;
    const variance = subset.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return avgVal - (avgVal * percentage / 100);
  });

  return { ma, upperBand, lowerBand };
}

/**
 * Helper: Buat array dropdown options untuk periode (1 hingga max)
 * @param {number} max - nilai maksimal
 * @returns {string} HTML string <option>...</option>
 */
function buildPeriodOptions(max = 20, selected = 20) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<option value="${i}" ${i === selected ? 'selected' : ''}>${i}</option>`;
  }
  return html;
}

/**
 * Helper: Buat array dropdown options untuk persentase Envelope
 * @param {number} selected - nilai yang dipilih default
 * @returns {string} HTML string <option>...</option>
 */
function buildPercentageOptions(selected = 2) {
  const values = [];
  for (let i = 0.25; i <= 5; i += 0.25) {
    values.push(parseFloat(i.toFixed(2)));
  }

  return values.map(v =>
    `<option value="${v}" ${v === selected ? 'selected' : ''}>${v.toFixed(2)}</option>`
  ).join('');
}
