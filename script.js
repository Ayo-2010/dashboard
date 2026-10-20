var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var RANGES = {
  '7': { sub: 'Last 7 days', factor: 0.34, sessions: 18400 },
  '30': { sub: 'Last 30 days', factor: 0.68, sessions: 51200 },
  '90': { sub: 'Last 90 days', factor: 1, sessions: 148600 }
};

var MONTH_BASE = [38200, 41500, 46800, 44200, 52400, 58900, 55200, 61800, 67400, 64100, 72600, 78900];

var STAT_DEFS = {
  '7': [
    { label: 'Revenue', value: 18920, money: true, change: 6.4, spark: [12, 14, 13, 16, 15, 18, 17, 21] },
    { label: 'Orders', value: 318, change: 3.2, spark: [22, 26, 24, 28, 27, 31, 29, 34] },
    { label: 'Customers', value: 244, change: -1.6, spark: [31, 30, 32, 29, 28, 27, 28, 26] },
    { label: 'Conversion', value: 3.4, decimals: 1, suffix: '%', change: 0.4, spark: [8, 9, 8, 10, 9, 11, 10, 12] }
  ],
  '30': [
    { label: 'Revenue', value: 128420, money: true, change: 12.8, spark: [41, 46, 44, 52, 49, 58, 56, 66] },
    { label: 'Orders', value: 2140, change: 9.1, spark: [120, 134, 128, 149, 141, 162, 158, 181] },
    { label: 'Customers', value: 1682, change: 4.7, spark: [210, 222, 219, 236, 231, 248, 244, 259] },
    { label: 'Conversion', value: 3.9, decimals: 1, suffix: '%', change: -0.3, spark: [14, 15, 14, 16, 15, 14, 13, 13] }
  ],
  '90': [
    { label: 'Revenue', value: 384760, money: true, change: 21.5, spark: [58, 64, 61, 72, 69, 82, 78, 91] },
    { label: 'Orders', value: 6480, change: 17.4, spark: [380, 402, 396, 448, 431, 486, 470, 522] },
    { label: 'Customers', value: 4720, change: 13.2, spark: [610, 638, 622, 676, 662, 704, 690, 735] },
    { label: 'Conversion', value: 4.2, decimals: 1, suffix: '%', change: 0.9, spark: [31, 33, 32, 35, 34, 37, 36, 39] }
  ]
};

var DONUT = {
  '7': [
    { label: 'Organic search', value: 42 },
    { label: 'Direct', value: 26 },
    { label: 'Referral', value: 18 },
    { label: 'Social', value: 14 }
  ],
  '30': [
    { label: 'Organic search', value: 38 },
    { label: 'Direct', value: 29 },
    { label: 'Referral', value: 19 },
    { label: 'Social', value: 14 }
  ],
  '90': [
    { label: 'Organic search', value: 35 },
    { label: 'Direct', value: 31 },
    { label: 'Referral', value: 21 },
    { label: 'Social', value: 13 }
  ]
};

var ORDERS = [
  { id: 'ORD-1043', customer: 'Helena Marsh', date: '2026-10-18', status: 'Paid', amount: 1284.5 },
  { id: 'ORD-1042', customer: 'Dev Patel', date: '2026-10-17', status: 'Pending', amount: 342.0 },
  { id: 'ORD-1041', customer: 'Ana Ferreira', date: '2026-10-17', status: 'Paid', amount: 4890.75 },
  { id: 'ORD-1040', customer: 'Tomas Weber', date: '2026-10-16', status: 'Refunded', amount: 199.99 },
  { id: 'ORD-1039', customer: 'Yuki Tanaka', date: '2026-10-15', status: 'Paid', amount: 2740.2 },
  { id: 'ORD-1038', customer: 'Grace Okafor', date: '2026-10-14', status: 'Paid', amount: 655.0 },
  { id: 'ORD-1037', customer: 'Ravi Nair', date: '2026-10-13', status: 'Pending', amount: 1120.4 },
  { id: 'ORD-1036', customer: 'Lena Kovacs', date: '2026-10-12', status: 'Paid', amount: 378.25 },
  { id: 'ORD-1035', customer: 'Oscar Diaz', date: '2026-10-11', status: 'Refunded', amount: 86.9 },
  { id: 'ORD-1034', customer: 'Maya Lindqvist', date: '2026-10-10', status: 'Paid', amount: 5412.0 }
];

var SEG_COLORS = ['--c1', '--c2', '--c3', '--c4'];

var statsEl = document.getElementById('stats');
var barCanvas = document.getElementById('barChart');
var donutCanvas = document.getElementById('donutChart');
var legendEl = document.getElementById('legend');
var tableBody = document.getElementById('tableBody');
var sortBy = document.getElementById('sortBy');
var statusFilter = document.getElementById('statusFilter');
var rangeChips = document.getElementById('rangeChips');
var themeBtn = document.getElementById('themeBtn');
var barTip = document.getElementById('barTip');
var donutTip = document.getElementById('donutTip');
var barSub = document.getElementById('barSub');
var donutSub = document.getElementById('donutSub');
var table = document.getElementById('table');
var emptyRow = document.getElementById('emptyRow');

var range = '30';
var sortKey = 'date';
var sortDir = 'desc';
var barGeom = [];
var hoverBar = -1;
var hoverSeg = -1;

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function compact(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(v);
}

function num(v, decimals) {
  return v.toLocaleString('en-US', {
    minimumFractionDigits: decimals || 0,
    maximumFractionDigits: decimals || 0
  });
}

function money(v) {
  return '$' + num(v, v % 1 === 0 ? 0 : 2);
}

function formatStat(def) {
  var body = num(def.value, def.decimals || 0) + (def.suffix || '');
  return (def.money ? '$' : '') + body;
}

function sparkline(points, color) {
  var w = 92;
  var h = 32;
  var pad = 4;
  var min = Math.min.apply(null, points);
  var max = Math.max.apply(null, points);
  var span = (max - min) || 1;
  var step = (w - pad * 2) / (points.length - 1);
  var coords = points.map(function (p, i) {
    var x = pad + i * step;
    var y = h - pad - ((p - min) / span) * (h - pad * 2);
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' +
    coords.join(' ') + '"/></svg>';
}

function renderStats() {
  var defs = STAT_DEFS[range];
  var up = cssVar('--up');
  var down = cssVar('--down');
  statsEl.innerHTML = defs.map(function (d) {
    var positive = d.change >= 0;
    var color = positive ? up : down;
    return '<article class="stat">' +
      '<label>' + d.label + '</label>' +
      '<div class="stat-value">' + formatStat(d) + '</div>' +
      '<div class="stat-foot">' +
      '<span class="delta ' + (positive ? 'up' : 'down') + '">' +
      (positive ? '▲' : '▼') + ' ' + Math.abs(d.change).toFixed(1) + '%</span>' +
      sparkline(d.spark, color) +
      '</div></article>';
  }).join('');
}

function currentBars() {
  var f = RANGES[range].factor;
  return MONTH_BASE.map(function (v) {
    return Math.round(v * f);
  });
}

function niceMax(v) {
  var rough = v / 4;
  var pow = Math.pow(10, Math.floor(Math.log10(rough)));
  var n = rough / pow;
  var mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  var step = mult * pow;
  return Math.ceil(v / step) * step;
}

function roundTopRect(ctx, x, y, w, h, r) {
  var rr = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawBars() {
  var dpr = window.devicePixelRatio || 1;
  var w = barCanvas.clientWidth || 480;
  var h = barCanvas.clientHeight || 280;
  barCanvas.width = Math.round(w * dpr);
  barCanvas.height = Math.round(h * dpr);
  var ctx = barCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  var padL = 58;
  var padR = 12;
  var padT = 16;
  var padB = 30;
  var plotW = w - padL - padR;
  var plotH = h - padT - padB;
  var data = currentBars();
  var top = niceMax(Math.max.apply(null, data)) || 1;
  var ink = cssVar('--ink');
  var muted = cssVar('--muted');
  var grid = cssVar('--grid');
  var accent = cssVar('--accent');

  ctx.font = '600 11px Figtree, system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  var divisions = 4;
  for (var t = 0; t <= divisions; t++) {
    var val = (top / divisions) * t;
    var y = padT + plotH - (plotH * (t / divisions));
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, Math.round(y) + 0.5);
    ctx.lineTo(w - padR, Math.round(y) + 0.5);
    ctx.stroke();
    ctx.fillStyle = muted;
    ctx.textAlign = 'right';
    ctx.fillText('$' + compact(val), padL - 10, y);
  }

  var band = plotW / data.length;
  var barW = Math.min(30, band * 0.58);
  barGeom = [];

  for (var i = 0; i < data.length; i++) {
    var bh = Math.round((data[i] / top) * plotH);
    var x = padL + band * i + (band - barW) / 2;
    var y2 = padT + plotH - bh;
    barGeom.push({ x: x, w: barW, y: y2, h: bh, value: data[i], index: i });

    var grad = ctx.createLinearGradient(0, y2, 0, y2 + bh);
    if (i === hoverBar) {
      grad.addColorStop(0, accent);
      grad.addColorStop(1, accent);
    } else {
      grad.addColorStop(0, accent);
      grad.addColorStop(1, 'rgba(47, 91, 255, 0.35)');
    }
    ctx.fillStyle = grad;
    roundTopRect(ctx, x, y2, barW, Math.max(bh, 2), 6);

    ctx.fillStyle = i === hoverBar ? ink : muted;
    ctx.textAlign = 'center';
    ctx.font = (i === hoverBar ? '700 ' : '600 ') + '11px Figtree, system-ui, sans-serif';
    ctx.fillText(MONTHS[i], padL + band * i + band / 2, h - padB / 2 + 2);
  }

  ctx.strokeStyle = grid;
  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH + 0.5);
  ctx.lineTo(w - padR, padT + plotH + 0.5);
  ctx.stroke();
}

function renderLegend() {
  var data = DONUT[range];
  legendEl.innerHTML = data.map(function (d, i) {
    return '<li data-index="' + i + '">' +
      '<span class="swatch" style="background:' + cssVar(SEG_COLORS[i % 4]) + '"></span>' +
      '<span class="lname">' + d.label + '</span>' +
      '<span class="lval">' + d.value + '%</span>' +
      '</li>';
  }).join('');
}

function drawDonut() {
  var dpr = window.devicePixelRatio || 1;
  var size = donutCanvas.clientWidth || 230;
  donutCanvas.width = Math.round(size * dpr);
  donutCanvas.height = Math.round(size * dpr);
  var ctx = donutCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  var data = DONUT[range];
  var total = data.reduce(function (a, b) { return a + b.value; }, 0);
  var cx = size / 2;
  var cy = size / 2;
  var outer = size / 2 - 10;
  var thickness = size * 0.17;
  var inner = outer - thickness;

  donutGeom = [];
  var start = -Math.PI / 2;
  data.forEach(function (d, i) {
    var angle = (d.value / total) * Math.PI * 2;
    var end = start + angle;
    var grow = i === hoverSeg ? 3 : 0;
    ctx.beginPath();
    ctx.arc(cx, cy, outer - thickness / 2, start + 0.012, end - 0.012);
    ctx.lineWidth = thickness + grow;
    ctx.strokeStyle = cssVar(SEG_COLORS[i % 4]);
    ctx.lineCap = 'butt';
    ctx.stroke();
    donutGeom.push({ start: start, end: end });
    start = end;
  });

  var ink = cssVar('--ink');
  var muted = cssVar('--muted');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (hoverSeg >= 0) {
    ctx.fillStyle = ink;
    ctx.font = '800 1.4rem Figtree, system-ui, sans-serif';
    ctx.fillText(DONUT[range][hoverSeg].value + '%', cx, cy - 8);
    ctx.fillStyle = muted;
    ctx.font = '600 11px Figtree, system-ui, sans-serif';
    ctx.fillText(DONUT[range][hoverSeg].label, cx, cy + 14);
  } else {
    ctx.fillStyle = ink;
    ctx.font = '800 1.25rem Figtree, system-ui, sans-serif';
    ctx.fillText(compact(RANGES[range].sessions), cx, cy - 8);
    ctx.fillStyle = muted;
    ctx.font = '600 11px Figtree, system-ui, sans-serif';
    ctx.fillText('sessions', cx, cy + 14);
  }
}

var donutGeom = [];

function drawAll() {
  drawBars();
  drawDonut();
  renderLegend();
}

function renderRange() {
  barSub.textContent = RANGES[range].sub;
  donutSub.textContent = 'Share of sessions · ' + RANGES[range].sub.toLowerCase();
  renderStats();
  drawAll();
}

function compare(a, b) {
  var av = a[sortKey];
  var bv = b[sortKey];
  if (sortKey === 'amount') {
    return a.amount - b.amount;
  }
  if (sortKey === 'date') {
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  }
  if (sortKey === 'id') {
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  }
  av = String(av).toLowerCase();
  bv = String(bv).toLowerCase();
  return av < bv ? -1 : av > bv ? 1 : 0;
}

function fmtDate(iso) {
  var parts = iso.split('-');
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTable() {
  var filter = statusFilter.value;
  var rows = ORDERS.filter(function (o) {
    return filter === 'all' || o.status === filter;
  });
  rows.sort(compare);
  if (sortDir === 'desc') rows.reverse();

  tableBody.innerHTML = '';
  rows.forEach(function (o) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="mono">' + o.id + '</td>' +
      '<td>' + o.customer + '</td>' +
      '<td>' + fmtDate(o.date) + '</td>' +
      '<td><span class="badge ' + o.status + '">' + o.status + '</span></td>' +
      '<td class="num mono">' + money(o.amount) + '</td>';
    tableBody.appendChild(tr);
  });
  tableBody.appendChild(emptyRow);
  emptyRow.hidden = rows.length > 0;

  var heads = table.querySelectorAll('th.sortable');
  for (var i = 0; i < heads.length; i++) {
    var th = heads[i];
    th.classList.remove('sorted-asc', 'sorted-desc');
    th.removeAttribute('aria-sort');
    if (th.dataset.key === sortKey) {
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      th.setAttribute('aria-sort', sortDir === 'asc' ? 'ascending' : 'descending');
    }
  }
  sortBy.value = sortKey;
}

rangeChips.addEventListener('click', function (e) {
  var btn = e.target.closest('.chip');
  if (!btn) return;
  range = btn.dataset.range;
  var chips = rangeChips.querySelectorAll('.chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].classList.toggle('is-active', chips[i] === btn);
  }
  hoverBar = -1;
  hoverSeg = -1;
  barTip.hidden = true;
  donutTip.hidden = true;
  renderRange();
});

themeBtn.addEventListener('click', function () {
  var root = document.documentElement;
  var dark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', dark ? 'light' : 'dark');
  themeBtn.textContent = dark ? 'Dark' : 'Light';
  try {
    localStorage.setItem('meridian:theme', dark ? 'light' : 'dark');
  } catch (err) {
  }
  drawAll();
});

table.querySelector('thead').addEventListener('click', function (e) {
  var th = e.target.closest('th.sortable');
  if (!th) return;
  var key = th.dataset.key;
  if (key === sortKey) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = 'asc';
  }
  renderTable();
});

table.querySelector('thead').addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var th = e.target.closest('th.sortable');
  if (!th) return;
  e.preventDefault();
  var key = th.dataset.key;
  if (key === sortKey) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = 'asc';
  }
  renderTable();
});

sortBy.addEventListener('change', function () {
  sortKey = sortBy.value;
  sortDir = sortKey === 'amount' || sortKey === 'date' ? 'desc' : 'asc';
  renderTable();
});

statusFilter.addEventListener('change', renderTable);

barCanvas.addEventListener('mousemove', function (e) {
  var rect = barCanvas.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var found = -1;
  for (var i = 0; i < barGeom.length; i++) {
    var g = barGeom[i];
    if (x >= g.x - 8 && x <= g.x + g.w + 8) {
      found = i;
      break;
    }
  }
  if (found !== hoverBar) {
    hoverBar = found;
    drawBars();
  }
  if (found >= 0) {
    var g2 = barGeom[found];
    barTip.hidden = false;
    barTip.textContent = MONTHS[found] + ' · $' + num(g2.value);
    barTip.style.left = (g2.x + g2.w / 2) + 'px';
    barTip.style.top = g2.y + 'px';
  } else {
    barTip.hidden = true;
  }
});

barCanvas.addEventListener('mouseleave', function () {
  hoverBar = -1;
  barTip.hidden = true;
  drawBars();
});

donutCanvas.addEventListener('mousemove', function (e) {
  var rect = donutCanvas.getBoundingClientRect();
  var size = rect.width;
  var cx = size / 2;
  var cy = size / 2;
  var x = e.clientX - rect.left - cx;
  var y = e.clientY - rect.top - cy;
  var dist = Math.sqrt(x * x + y * y);
  var outer = size / 2 - 10;
  var inner = outer - size * 0.17;
  var found = -1;
  if (dist <= outer + 6 && dist >= inner - 6) {
    var ang = Math.atan2(y, x);
    for (var i = 0; i < donutGeom.length; i++) {
      var s = donutGeom[i].start;
      var en = donutGeom[i].end;
      var norm = ang;
      while (norm < s) norm += Math.PI * 2;
      if (norm >= s && norm <= en) {
        found = i;
        break;
      }
    }
  }
  if (found !== hoverSeg) {
    hoverSeg = found;
    drawDonut();
  }
  if (found >= 0) {
    donutTip.hidden = false;
    donutTip.textContent = DONUT[range][found].label + ' · ' + DONUT[range][found].value + '%';
    donutTip.style.left = (cx + (e.clientX - rect.left - cx) * 0.75) + 'px';
    donutTip.style.top = (cy + (e.clientY - rect.top - cy) * 0.75) + 'px';
  } else {
    donutTip.hidden = true;
  }
});

donutCanvas.addEventListener('mouseleave', function () {
  hoverSeg = -1;
  donutTip.hidden = true;
  drawDonut();
});

legendEl.addEventListener('mouseover', function (e) {
  var li = e.target.closest('li');
  if (!li) return;
  hoverSeg = Number(li.dataset.index);
  drawDonut();
});

legendEl.addEventListener('mouseout', function () {
  hoverSeg = -1;
  drawDonut();
});

var resizeTimer = null;
window.addEventListener('resize', function () {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(drawAll, 120);
});

(function init() {
  var saved = null;
  try {
    saved = localStorage.getItem('meridian:theme');
  } catch (e) {
    saved = null;
  }
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = 'Light';
  }
  hoverBar = -1;
  renderRange();
  renderTable();
})();
