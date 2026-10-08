// 青山キャンパス周辺 POI マップ
// Overture Maps Places → GeoJSON を MapLibre GL JS で表示する
// MapLibre GL JS v6 は ES モジュールとして配布されているので import で読み込む
import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.13.0/dist/maplibre-gl.mjs';

(function () {

  // GitHub Pages でも壊れないよう、すべて相対パスで読み込む
  const DATA_URL = 'data/aoyama_places.geojson';
  const META_URL = 'data/metadata.json';

  // 青山学院大学 青山キャンパス（OpenStreetMap Nominatim で確認した位置）
  const CAMPUS = [139.7104, 35.6606];

  // taxonomy.hierarchy の最上位（大分類）ごとの色と日本語名
  const GROUPS = [
    { key: 'food_and_drink', ja: '飲食', color: '#e4572e' },
    { key: 'shopping', ja: '買い物', color: '#f3a712' },
    { key: 'services_and_business', ja: 'サービス・ビジネス', color: '#5b8e7d' },
    { key: 'lifestyle_services', ja: '生活サービス（美容など）', color: '#c45ab3' },
    { key: 'health_care', ja: '医療・健康', color: '#d7263d' },
    { key: 'arts_and_entertainment', ja: '芸術・娯楽', color: '#7b2cbf' },
    { key: 'education', ja: '教育', color: '#1f5fa8' },
    { key: 'sports_and_recreation', ja: 'スポーツ・レジャー', color: '#2a9d8f' },
    { key: 'travel_and_transportation', ja: '交通・旅行', color: '#3d405b' },
    { key: 'community_and_government', ja: '公共・コミュニティ', color: '#8d6e63' },
    { key: 'cultural_and_historic', ja: '文化・歴史', color: '#a47e1b' },
    { key: 'lodging', ja: '宿泊', color: '#00838f' },
    { key: 'geographic_entities', ja: '地理的な場所', color: '#43a047' },
    { key: 'uncategorized', ja: '分類なし', color: '#9e9e9e' }
  ];
  const groupByKey = Object.fromEntries(GROUPS.map((g) => [g.key, g]));

  // フィルタの状態
  const state = {
    minConfidence: 0,
    query: '',
    groups: new Set(GROUPS.map((g) => g.key))
  };

  let allFeatures = [];

  // ---------- 地図 ----------
  const map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        gsi_pale: {
          type: 'raster',
          tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 18,
          attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>'
        }
      },
      layers: [{ id: 'gsi_pale', type: 'raster', source: 'gsi_pale' }]
    },
    center: CAMPUS,
    zoom: 15,
    maxZoom: 20,
    attributionControl: false
  });

  // ブラウザの開発者ツールから確認できるように公開しておく
  window.aoyamaMap = map;

  map.addControl(new maplibregl.NavigationControl(), 'top-left');
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    // 提供元ごとのライセンスはパネルの「出典」タブに記載
    customAttribution: 'POI: <a href="https://overturemaps.org/" target="_blank" rel="noopener">© Overture Maps Foundation</a>'
  }), 'bottom-right');

  // ---------- ユーティリティ ----------
  // データは外部由来なので、HTML に入れる前に必ずエスケープする
  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmt(n) {
    return n.toLocaleString('ja-JP');
  }

  function safeUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
    } catch (e) {
      return null;
    }
  }

  // MapLibre の setData / ポップアップでは入れ子の配列が文字列化されることがあるので戻す
  function parseSources(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch (e) { return []; }
    }
    return [];
  }

  // ---------- フィルタ ----------
  function buildFilter() {
    const filter = ['all',
      ['>=', ['coalesce', ['get', 'confidence'], 0], state.minConfidence],
      ['in', ['get', 'group'], ['literal', Array.from(state.groups)]]
    ];
    if (state.query) {
      filter.push(['any',
        ['in', state.query, ['downcase', ['coalesce', ['get', 'name'], '']]],
        ['in', state.query, ['downcase', ['coalesce', ['get', 'name_en'], '']]],
        ['in', state.query, ['downcase', ['coalesce', ['get', 'basic_category'], '']]]
      ]);
    }
    return filter;
  }

  function matches(p) {
    if ((p.confidence ?? 0) < state.minConfidence) return false;
    if (!state.groups.has(p.group)) return false;
    if (state.query) {
      const hay = [p.name, p.name_en, p.basic_category].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  }

  function applyFilter() {
    const filter = buildFilter();
    ['poi', 'poi-label'].forEach((id) => { if (map.getLayer(id)) map.setFilter(id, filter); });
    const visible = allFeatures.reduce((n, f) => n + (matches(f.properties) ? 1 : 0), 0);
    document.getElementById('count-visible').textContent = fmt(visible);
  }

  // ---------- 凡例 ----------
  function buildLegend(counts) {
    const ul = document.getElementById('legend');
    ul.innerHTML = '';
    GROUPS.forEach((g) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<label>' +
        '<input type="checkbox" value="' + esc(g.key) + '" checked>' +
        '<span class="swatch" style="background:' + g.color + '"></span>' +
        '<span class="label">' + esc(g.ja) + ' <small>' + esc(g.key) + '</small></span>' +
        '<span class="num">' + fmt(counts[g.key] || 0) + '</span>' +
        '</label>';
      ul.appendChild(li);
    });
    ul.addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;
      if (e.target.checked) state.groups.add(e.target.value);
      else state.groups.delete(e.target.value);
      applyFilter();
    });
  }

  function setAllGroups(on) {
    document.querySelectorAll('#legend input[type=checkbox]').forEach((cb) => {
      cb.checked = on;
      if (on) state.groups.add(cb.value);
      else state.groups.delete(cb.value);
    });
    applyFilter();
  }

  // ---------- ポップアップ ----------
  function popupHtml(p, others) {
    const group = groupByKey[p.group] || groupByKey.uncategorized;
    const rows = [];
    const row = (th, td) => rows.push('<tr><th>' + th + '</th><td>' + td + '</td></tr>');

    row('大分類', '<span style="color:' + group.color + '">●</span> ' + esc(group.ja));
    if (p.basic_category) row('basic_category', '<code>' + esc(p.basic_category) + '</code>');
    if (p.taxonomy_hierarchy) row('taxonomy', esc(p.taxonomy_hierarchy));

    if (p.confidence !== undefined && p.confidence !== null) {
      const c = Number(p.confidence);
      row('confidence', esc(c.toFixed(3)) +
        '<span class="conf-bar"><span style="width:' + Math.round(c * 100) + '%"></span></span>');
    } else {
      row('confidence', 'データなし');
    }

    row('GERS ID', '<span class="gers">' + esc(p.id) + '</span>');

    const sources = parseSources(p.sources);
    if (sources.length) {
      row('データソース', sources.map((s) =>
        '<span class="src-tag" title="' + esc(s.license || '') + '">' + esc(s.dataset) +
        (s.license ? ' · ' + esc(s.license) : '') + '</span>').join(''));
    }

    if (p.operating_status) row('営業状況', esc(p.operating_status));
    if (p.address) row('住所', esc(p.address));
    const web = p.website && safeUrl(p.website);
    if (web) row('Web', '<a href="' + esc(web) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(web) + '</a>');

    return '<div class="poi-popup">' +
      '<h3>' + esc(p.name || '(名前なし)') + '</h3>' +
      (p.name_en && p.name_en !== p.name ? '<p class="name-en">' + esc(p.name_en) + '</p>' : '') +
      '<table>' + rows.join('') + '</table>' +
      (others && others.length
        ? '<p class="overlap">この付近に他 ' + others.length + ' 件: ' +
          others.slice(0, 5).map(esc).join('、') + (others.length > 5 ? ' …' : '') +
          '<br><small>ズームインすると個別に選べます</small></p>'
        : '') +
      '</div>';
  }

  // ---------- データ読み込み ----------
  async function loadJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url + ' の読み込みに失敗しました (HTTP ' + res.status + ')');
    return res.json();
  }

  function showMeta(meta) {
    document.getElementById('about-release').textContent = meta.release;
    document.getElementById('credit-release').textContent = meta.release;
    const ul = document.getElementById('credit-sources');
    ul.innerHTML = '';
    Object.entries(meta.licenses).forEach(([label, n]) => {
      const li = document.createElement('li');
      li.textContent = label + ': ' + fmt(n) + ' 件の POI で使用';
      ul.appendChild(li);
    });
  }

  map.on('load', async () => {
    const loading = document.getElementById('loading');
    try {
      const [geojson, meta] = await Promise.all([loadJson(DATA_URL), loadJson(META_URL)]);
      allFeatures = geojson.features;

      const counts = {};
      allFeatures.forEach((f) => { counts[f.properties.group] = (counts[f.properties.group] || 0) + 1; });

      document.getElementById('count-total').textContent = fmt(allFeatures.length);
      document.getElementById('about-count').textContent = fmt(allFeatures.length);
      showMeta(meta);
      buildLegend(counts);

      // 取得範囲 (bbox) を枠線で表示
      const [w, s, e, n] = meta.bbox;
      map.addSource('bbox', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] }
        }
      });
      map.addLayer({
        id: 'bbox-line',
        type: 'line',
        source: 'bbox',
        paint: { 'line-color': '#1f5fa8', 'line-width': 1.5, 'line-dasharray': [4, 3] }
      });

      map.addSource('places', { type: 'geojson', data: geojson });

      const colorExpr = ['match', ['get', 'group']];
      GROUPS.forEach((g) => colorExpr.push(g.key, g.color));
      colorExpr.push('#9e9e9e');

      map.addLayer({
        id: 'poi',
        type: 'circle',
        source: 'places',
        paint: {
          'circle-color': colorExpr,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 2, 16, 4, 19, 8],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 16, 1],
          // confidence が低い POI ほど薄く表示する
          'circle-opacity': ['interpolate', ['linear'], ['coalesce', ['get', 'confidence'], 0], 0, 0.35, 1, 0.95]
        }
      });

      map.addLayer({
        id: 'poi-label',
        type: 'symbol',
        source: 'places',
        minzoom: 18,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1],
          'text-anchor': 'top',
          'text-optional': true
        },
        paint: { 'text-color': '#333', 'text-halo-color': '#fff', 'text-halo-width': 1.2 }
      });

      // キャンパスの位置
      new maplibregl.Marker({ color: '#1f5fa8' })
        .setLngLat(CAMPUS)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText('青山学院大学 青山キャンパス'))
        .addTo(map);

      map.on('click', 'poi', (e) => {
        const f = e.features[0];
        // 同じビルの POI などが重なっていることが多いので、クリック位置にある他の名前も示す
        const [lng, lat] = f.geometry.coordinates;
        const others = e.features.slice(1).map((o) => o.properties.name);
        new maplibregl.Popup({ maxWidth: '320px' })
          .setLngLat([lng, lat])
          .setHTML(popupHtml(f.properties, others))
          .addTo(map);
      });
      map.on('mouseenter', 'poi', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'poi', () => { map.getCanvas().style.cursor = ''; });

      applyFilter();
      loading.classList.add('is-hidden');
    } catch (err) {
      console.error(err);
      loading.textContent = 'データの読み込みに失敗しました: ' + err.message;
      loading.classList.add('is-error');
    }
  });

  // ---------- UI ----------
  const confInput = document.getElementById('confidence');
  confInput.addEventListener('input', () => {
    state.minConfidence = Number(confInput.value);
    document.getElementById('conf-value').textContent = state.minConfidence.toFixed(2);
    applyFilter();
  });

  let searchTimer;
  document.getElementById('search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value.trim().toLowerCase();
      applyFilter();
    }, 200);
  });

  document.getElementById('cat-all').addEventListener('click', () => setAllGroups(true));
  document.getElementById('cat-none').addEventListener('click', () => setAllGroups(false));

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('.tab-body').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.tabBody === tab.dataset.tab);
      });
    });
  });

  const panel = document.getElementById('panel');
  const toggle = document.getElementById('panel-toggle');
  toggle.addEventListener('click', () => {
    const collapsed = panel.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    map.resize();
  });
})();
