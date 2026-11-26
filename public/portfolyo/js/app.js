/* S. Ahmet Cem Karaca — Mimarlık Portfolyosu · sayfa motoru ve şablonlar */
(function () {
  'use strict';
  const D = window.PORTFOLIO || { projects: {}, order: { akademik: [], otel: [] } };
  const P = D.projects;
  const ORDER = D.order;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const url = new URL(location.href);
  const PRINT = url.searchParams.has('print');

  /* ---------- profil verisi (CV'den) ---------- */
  const ME = {
    name: 'S. Ahmet Cem Karaca',
    mail: 'ahmcemkaraca@gmail.com',
    mail2: 'ahmet@ackaraca.me',
    web: 'ackaraca.me',
    city: 'Antalya / Kepez',
  };

  /* ---------- yardımcılar ---------- */
  const BASE = '/portfolyo/';
  const src = (p, f) => BASE + 'assets/' + p.slug + '/' + f;
  const tsrc = (p, f) => (p.slug === '_process' ? BASE + 'assets/_process/' + f : BASE + 'assets/_thumbs/' + p.slug + '__' + f);
  function img(p, it, opt) {
    opt = opt || {};
    const cls = ['fig', opt.contain ? 'contain' : '', opt.sh ? 'sh' : '', opt.cls || ''].join(' ').trim();
    const a = opt.a ? ' data-a="' + opt.a + '"' + (opt.d != null ? ' style="--d:' + opt.d + 's"' : '') : '';
    const style = opt.style ? ' style="' + opt.style + '"' : '';
    return '<div class="' + cls + '"' + a + style + '><img data-src="' + esc(opt.thumb ? tsrc(p, it.file) : src(p, it.file)) + '" alt="' + esc(it.caption || p.title) + '" decoding="async">' +
      (opt.ovl && it.caption ? '<div class="ovl">' + esc(it.caption) + '</div>' : '') + '</div>';
  }
  function cell(p, it, opt) {
    opt = opt || {};
    return '<div class="cell">' + img(p, it, opt) + (it.caption ? '<div class="cap">' + esc(it.caption) + '</div>' : '') + '</div>';
  }
  const run = (left, right) => '<div class="run"><span>' + left + '</span><span>' + right + '</span></div>';
  const foot = (left, n) => '<div class="foot"><span>' + left + '</span><span class="n">' + pad(n) + '</span></div>';
  const kindName = (k) => (k === 'otel' ? 'Otel Projeleri' : 'Akademik Projeler');

  function allPool(kind) {
    const out = [];
    const list = kind === 'otel' ? ORDER.otel : kind === 'akademik' ? ORDER.akademik : ORDER.akademik.concat(ORDER.otel);
    list.forEach((s) => {
      const p = P[s];
      if (!p) return;
      if (p.hero) out.push({ p, it: p.hero });
      (p.visuals || []).forEach((v) => { if (!/^(plan|detay|axo|kesit|drone_detay)/.test(v.file)) out.push({ p, it: v }); });
    });
    return out;
  }


  /* ---------- boşluksuz yerleşim (guillotine paketleme) ---------- */
  function permutations(a) { if (a.length <= 1) return [a]; const o = []; a.forEach((x, i) => permutations(a.slice(0, i).concat(a.slice(i + 1))).forEach((r) => o.push([x].concat(r)))); return o; }
  function genTrees(items) {
    if (items.length === 1) return [{ leaf: items[0], A: items[0].ar }];
    const out = [];
    for (let s = 1; s < items.length; s++) {
      const L = genTrees(items.slice(0, s)), Rr = genTrees(items.slice(s));
      L.forEach((l) => Rr.forEach((r) => {
        out.push({ dir: 'v', a: l, b: r, A: l.A + r.A });
        out.push({ dir: 'h', a: l, b: r, A: 1 / (1 / l.A + 1 / r.A) });
      }));
    }
    return out;
  }
  let AT = 1;
  // Maliyetler yalnızca toplanır; bilinen en iyi toplama (max) ulaşan dal erken bırakılır. Seçilen yerleşim değişmez.
  function evalTree(t, W, H, gap, cap, max) {
    if (t.leaf) { const fh = Math.max(20, H - cap); const dv = Math.log((W / fh) / t.leaf.ar); const lr = Math.log(AT / Math.max(400, W * H)); return 6 * dv * dv + 0.7 * lr * lr + (Math.min(W, fh) < 90 ? 50 : 0); }
    if (t.dir === 'v') { const w1 = (W - gap) * t.a.A / (t.a.A + t.b.A); const c = evalTree(t.a, w1, H, gap, cap, max); return c >= max ? c : c + evalTree(t.b, W - gap - w1, H, gap, cap, max - c); }
    const i1 = 1 / t.a.A, i2 = 1 / t.b.A, h1 = (H - gap) * i1 / (i1 + i2);
    const c = evalTree(t.a, W, h1, gap, cap, max);
    return c >= max ? c : c + evalTree(t.b, W, H - gap - h1, gap, cap, max - c);
  }
  function renderTree(t, W, H, gap, cap, mk) {
    if (t.leaf) { const fh = Math.max(20, H - cap); const dev = Math.abs(Math.log((W / fh) / t.leaf.ar)); return '<div class="gl" style="width:' + W.toFixed(1) + 'px;height:' + H.toFixed(1) + 'px">' + mk(t.leaf, dev) + '</div>'; }
    if (t.dir === 'v') { const w1 = (W - gap) * t.a.A / (t.a.A + t.b.A); return '<div class="gn" style="flex-direction:row;gap:' + gap + 'px;width:' + W.toFixed(1) + 'px;height:' + H.toFixed(1) + 'px">' + renderTree(t.a, w1, H, gap, cap, mk) + renderTree(t.b, W - gap - w1, H, gap, cap, mk) + '</div>'; }
    const i1 = 1 / t.a.A, i2 = 1 / t.b.A, h1 = (H - gap) * i1 / (i1 + i2);
    return '<div class="gn" style="flex-direction:column;gap:' + gap + 'px;width:' + W.toFixed(1) + 'px;height:' + H.toFixed(1) + 'px">' + renderTree(t.a, W, h1, gap, cap, mk) + renderTree(t.b, W, H - gap - h1, gap, cap, mk) + '</div>';
  }
  function pack(p, list, W, H, opt) {
    opt = opt || {};
    const gap = opt.gap || 12, cap = opt.cap || 38;
    const items = list.map((it, i) => ({ p: it.p || p, it: it.it || it, ar: ((it.it || it).w && (it.it || it).h) ? (it.it || it).w / (it.it || it).h : 1.3, i }));
    AT = W * H / items.length;
    let best = null, bc = 1e18;
    const orders = items.length <= 6 ? permutations(items) : [items];
    orders.forEach((ord) => { genTrees(ord).forEach((tr) => { const c = evalTree(tr, W, H, gap, cap, bc); if (c < bc) { bc = c; best = tr; } }); });
    return renderTree(best, W, H, gap, cap, (leaf, dev) => {
      const photo = !/^(plan|detay|kesit|kampus|axo|gorunus|vaziyet|konsept|balon|aks|pafta|arsiv|yerlesim|genel|oda|struktur)/.test(leaf.it.file) || opt.cover;
      const fit = dev < (photo ? 0.5 : 0.1);
      return cell(leaf.p, leaf.it, { a: 'zoom', d: 0.1 + leaf.i * 0.1, contain: !fit, cls: (fit ? 'pkc' : 'pkt') + (photo ? ' photo' : '') });
    });
  }

  /* ---------- sayfa betimleyicileri ---------- */
  const pages = [];
  const add = (o) => { pages.push(o); return pages.length; };

  add({ type: 'cover', title: 'Kapak' });
  add({ type: 'about', title: 'Hakkımda' });
  add({ type: 'cv', title: 'Eğitim & Deneyim' });
  add({ type: 'skills', title: 'Yetkinlikler' });
  add({ type: 'toc', title: 'İçindekiler' });
  const dvA = add({ type: 'divider', kind: 'akademik', title: 'Akademik Projeler' });
  const proj = [];
  let seq = 0;
  ORDER.akademik.forEach((s, i) => {
    const p = P[s]; if (!p) return;
    seq++;
    const first = pages.length + 1;
    proj.push({ p, first, idx: i + 1, total: ORDER.akademik.length, kind: 'akademik', seq });
    add({ type: 'ph', p, idx: i + 1, total: ORDER.akademik.length, title: p.title });
    add({ type: 'pc', p, idx: i + 1, title: p.title + ' — Kavram' });
    add({ type: 'pd', p, idx: i + 1, title: p.title + ' — Çizimler' });
    add({ type: 'pv', p, idx: i + 1, title: p.title + ' — Görseller' });
  });
  const dvO = add({ type: 'divider', kind: 'otel', title: 'Otel Projeleri' });
  ORDER.otel.forEach((s, i) => {
    const p = P[s]; if (!p) return;
    seq++;
    const first = pages.length + 1;
    proj.push({ p, first, idx: i + 1, total: ORDER.otel.length, kind: 'otel', seq });
    add({ type: 'ho', p, idx: i + 1, total: ORDER.otel.length, title: p.title });
    add({ type: 'hp', p, idx: i + 1, title: p.title + ' — Planlar' });
  });
  add({ type: 'proc', title: 'Arşivden Pafta’ya' });
  add({ type: 'mosaic', title: 'Seçki' });
  add({ type: 'end', title: 'İletişim' });
  const TOTAL = pages.length;

  /* ---------- şablonlar ---------- */
  const T = {};

  T.cover = () => {
    const pk = (slug, list) => { const p = P[slug]; if (!p) return []; const out = []; list.forEach((k) => { const [f, i] = k.split(':'); const v = f === 'hero' ? p.hero : (p[f] || [])[+i]; if (v) out.push({ p, it: v }); }); return out; };
    const groups = [
      pk('tasarim8', ['hero', 'visuals:0', 'drawings:0', 'visuals:1', 'visuals:2', 'concept_imgs:0', 'drawings:1', 'visuals:3', 'visuals:4', 'drawings:2']),
      pk('tasarim5', ['hero', 'visuals:0', 'visuals:1', 'visuals:2', 'visuals:3', 'visuals:4', 'concept_imgs:0', 'concept_imgs:1']),
      pk('tasarim6', ['hero', 'visuals:0', 'visuals:1', 'drawings:0', 'visuals:2', 'visuals:3', 'visuals:4', 'concept_imgs:0']),
      pk('fantasia', ['drawings:0']),
    ];
    const pool = [];
    for (let r = 0; r < 12; r++) groups.forEach((g) => { if (g[r]) pool.push(g[r]); });
    const NC = 5, per = 8, cols = [[], [], [], [], []];
    for (let i = 0; i < NC * per; i++) { const e = pool[i % Math.max(1, pool.length)]; if (e) cols[i % NC].push(e); }
    const col = (a, k) => {
      if (!a.length) return '<div class="col"></div>';
      const html = a.concat(a).map((e, i) => img(e.p, e.it, { thumb: true, a: 'zoom', d: 0.25 + ((k * 3 + i) % 9) * 0.07 })).join('');
      return '<div class="col"><div class="drift ' + (k % 2 ? 'down' : 'up') + '" style="display:flex;flex-direction:column;gap:6px">' + html + '</div></div>';
    };
    return {
      cls: 'dark cover',
      html:
        '<div class="cols">' + cols.map((a, k) => col(a, k)).join('') + '</div><div class="shade"></div>' +
        '<div class="badge" data-a="down"><span class="ack"><span>ACK</span></span><span class="lbl" style="color:#EDEBE6">Mimarlık Portfolyosu · 2026</span></div>' +
        '<div class="name"><div class="lbl" data-a="left" style="margin-bottom:22px">Mimar</div>' +
        '<div class="h-xl" data-a="up" style="--d:.15s">S. Ahmet<br>Cem <em>Karaca</em></div></div>' +
        '<div class="sub"><div class="redbar" data-a="line" style="--d:.5s"></div>' +
        '<p data-a="up" style="--d:.6s;margin-top:18px;font-size:15px;line-height:1.6;color:rgba(237,235,230,.82)">Kentsel ölçekten yapı detayına, konuttan kamusal programlara uzanan <b style="color:#fff;font-weight:500">10 seçili proje</b>: akademik stüdyo çalışmaları ve 15’ten fazla otel çiziminden seçilen beş çalışma.</p></div>' +
        '<div class="meta"><span>Akdeniz Üniversitesi · Mimarlık · 2026</span><span>ackaraca.me</span></div>',
    };
  };

  T.about = (n) => ({
    cls: 'about',
    html:
      run('<b>ACK</b> &nbsp; Portfolyo', 'Hakkımda') +
      '<div class="quote"><span class="mark" data-a="up">“</span><div class="serif" data-a="up" style="--d:.1s">Mimarlık bilgimi yazılım ve yapay zekâ araçlarıyla birleştirerek, daha verimli ve disiplinler arası süreçler kurmak istiyorum.</div>' +
      '<div class="redbar" style="margin-top:26px" data-a="line"></div><div class="lbl mute" style="margin-top:16px" data-a="fade">' + ME.name + '</div></div>' +
      '<div class="bio"><div class="lbl" data-a="left" style="margin-bottom:18px">01 — Profil</div>' +
      '<p data-a="up" style="--d:.1s">2026’da Akdeniz Üniversitesi Mimarlık Bölümü’nden mezun oldum; 2027 yazında RWTH Aachen University’de M.Sc. Architecture programına başlıyorum. Sekiz yarıyıl boyunca kreş ve gençlik evinden konut, otel ve kentsel rehabilitasyona, bitirme projesi olarak da bir spor fakültesi kampüsüne uzanan farklı ölçek ve programlarda çalıştım.</p>' +
      '<p data-a="up" style="--d:.2s">Betemu Mimarlık’ta yarı zamanlı olarak avan proje çizimi, 3B modelleme ve görselleştirme yapıyor; otel, hostel ve pansiyon yapıları için rölöve alıp yangın tedbirleri planları hazırlıyorum. 2026’da <b style="color:var(--ink);font-weight:600">15’ten fazla otelin</b> çizimini yaptım; bu portfolyoda beşi yer alıyor.</p>' +
      '<p data-a="up" style="--d:.3s">Revit, Twinmotion ve AutoCAD ile üretim ve görselleştirme akışlarına hâkimim; yeni araçları, özellikle yapay zekâ destekli yazılım geliştirmeyi, iş akışıma hızla entegre ederim.</p></div>' +
      '<div class="contact">' +
      '<div data-a="up" style="--d:.35s"><small>E-posta</small><span><a href="mailto:' + ME.mail + '">' + ME.mail + '</a></span></div>' +
      '<div data-a="up" style="--d:.4s"><small>İş e-postası</small><span><a href="mailto:' + ME.mail2 + '">' + ME.mail2 + '</a></span></div>' +
      '<div data-a="up" style="--d:.45s"><small>Web</small><span><a href="https://' + ME.web + '">' + ME.web + '</a></span></div>' +
      '<div data-a="up" style="--d:.5s"><small>LinkedIn</small><span><a href="https://www.linkedin.com/in/ahmet-cem-karaca/">in/ahmet-cem-karaca</a></span></div></div>' +
      '<div class="stats">' +
      '<div class="stat" data-a="up" style="--d:.3s"><b data-count="10">10</b><span>Seçili proje</span></div>' +
      '<div class="stat" data-a="up" style="--d:.38s"><b data-count="8">8</b><span>Yarıyıl tasarım stüdyosu</span></div>' +
      '<div class="stat" data-a="up" style="--d:.46s"><b data-count="15" data-suf="+">15+</b><span>Otel yangın tedbirleri planı (2026)</span></div>' +
      '<div class="stat" data-a="up" style="--d:.54s"><b data-count="2027">2027</b><span>RWTH Aachen · M.Sc. Architecture</span></div></div>' +
      foot('Hakkımda', n),
  });

  T.cv = (n) => ({
    cls: 'cv',
    html:
      run('<b>ACK</b> &nbsp; Portfolyo', 'Eğitim & Deneyim') +
      '<div class="colL"><div class="lbl" data-a="left">02 — Deneyim</div><h2 data-a="up">Mesleki yolculuk</h2>' +
      '<div class="tl">' +
      '<div class="it now" data-a="up" style="--d:.1s"><div class="d">07/2026 — devam</div><h4>Betemu Mimarlık · Yarı zamanlı</h4><p>Avan proje çizimleri, 3B modelleme ve görselleştirme. Otel, hostel ve pansiyon yapılarının yangın yönetmeliğine uygunluğu için rölöve alma ve Yangın Tedbirleri Planları hazırlama.</p></div>' +
      '<div class="it now" data-a="up" style="--d:.18s"><div class="d">12/2022 — devam</div><h4>ACKaraca Limited (UK) · Kurucu / Sahibi</h4><p>Perakende satış, yazılım–oyun geliştirme ve mimari çizim. 2026: Anthropic’in Claude for Startups programına kabul edildi.</p></div>' +
      '<div class="it" data-a="up" style="--d:.26s"><div class="d">26/07/2025 — 01/09/2025</div><h4>Betemu Mimarlık · Stajyer (MİM 414)</h4><p>Ofis stajı: avan proje taslakları, ruhsat projesi çizimleri, belediye–mimar süreçleri.</p></div>' +
      '<div class="it" data-a="up" style="--d:.34s"><div class="d">01/07/2024 — 05/08/2024</div><h4>Alperen Türkmen İnşaat · Stajyer (MİM 316)</h4><p>Şantiye stajı: kaba ve ince yapı imalatları, aplikasyon, malzeme ve iş programı.</p></div>' +
      '<div class="it" data-a="up" style="--d:.42s"><div class="d">01/07/2023 — 01/08/2023</div><h4>Cenk Doğan Mimarlık · Stajyer (MİM 213)</h4><p>Mimari alan araştırması: yapıların sahada incelenmesi ve raporlanması.</p></div>' +
      '</div></div>' +
      '<div class="colR edu"><div class="lbl" data-a="left">03 — Eğitim</div><h2 data-a="up">Akademik</h2>' +
      '<div class="it" data-a="up" style="--d:.15s"><div class="lbl">04/2027 · Kabul alındı</div><h4>RWTH Aachen University</h4><p>M.Sc. Architecture · 2027 yaz döneminde başlıyor</p></div>' +
      '<div class="it" data-a="up" style="--d:.22s"><div class="lbl mute">06/2026 · Diploma</div><h4>Akdeniz Üniversitesi</h4><p>Mimarlık Bölümü · lisans</p></div>' +
      '<div class="it" data-a="up" style="--d:.29s"><div class="lbl mute">Liderlik</div><h4>MOLA — Mimari Oluşum Atölyesi</h4><p>Topluluğun kurucusu ve yöneticisi.</p></div>' +
      '<div class="it" data-a="up" style="--d:.36s"><div class="lbl mute">08/2025 · Katılım belgesi</div><h4>Kuşadası Mimarlar Odası</h4><p>“Kaybolanların Hafızası-2: Kuşadası Kentsel Sitinde Cengiz Bektaş’tan Günümüze”</p></div>' +
      '<div class="it" data-a="up" style="--d:.43s"><div class="lbl mute">06/2019 · Diploma</div><h4>Muratpaşa Türk Telekom Anadolu Lisesi</h4></div>' +
      '</div>' + foot('Eğitim & Deneyim', n),
  });

  T.skills = (n) => {
    const LV = ['', 'Temel', 'Orta', 'İleri'];
    const seg = (v, d) => '<i class="seg l' + v + '" style="--d:' + d + 's"><s></s><s></s><s></s></i>';
    const apps = [
      ['AutoCAD', '2020 – devam', 3, 3], ['Revit', '2020 – devam · mimari', 3, 3], ['Twinmotion', '2021 – devam', 3, 3], ['ArchiCAD', '2023 – devam', 1, 2],
      ['Lumion', '2021 – devam', 2, 2], ['Photoshop', '2018 – devam', 1, 1], ['Unreal Engine 5', '2020 – devam', 2, 2], ['QGIS', '2024 – 2025', 1, 1],
    ];
    return {
      cls: 'dark skills',
      html:
        run('<b>ACK</b> &nbsp; Portfolyo', 'Yetkinlikler') +
        '<div class="colA"><div class="lbl" data-a="left">04 — Mimari yazılımlar</div><h2 data-a="up">Araçlar</h2>' +
        '<div class="bhead"><span></span><span>Hız</span><span>Yetkinlik</span></div>' +
        apps.map((a, i) => '<div class="bar2" data-a="up" style="--d:' + (0.08 + i * 0.06) + 's"><div><b>' + a[0] + '</b><small>' + a[1] + '</small></div><div>' + seg(a[2], 0.5 + i * 0.08) + '<em>' + LV[a[2]] + '</em></div><div>' + seg(a[3], 0.6 + i * 0.08) + '<em>' + LV[a[3]] + '</em></div></div>').join('') +
        '</div>' +
        '<div class="colB">' +
        '<div class="blk" data-a="up" style="--d:.15s"><span class="lbl">Yazılım geliştirme ve YZ araçları</span><div class="chips"><span class="chip hot">Claude Code</span><span class="chip hot">OpenAI Codex</span><span class="chip hot">Cursor</span><span class="chip hot">OpenCode</span><span class="chip">VS Code</span></div><p>Oyun, web ve mimari yazılım projelerinde günlük, ileri seviye kullanım.</p></div>' +
        '<div class="blk" data-a="up" style="--d:.25s"><span class="lbl">Yazılım dilleri</span><div class="chips"><span class="chip">Python</span><span class="chip">JavaScript</span><span class="chip">C#</span></div><p>Temel seviye · YZ destekli.</p></div>' +
        '<div class="blk" data-a="up" style="--d:.35s"><span class="lbl">Diğer araçlar</span><ul class="dl"><li><b>Unreal Engine 4–5</b> Blueprints · Orta</li><li><b>Google Cloud · DevOps</b> Temel–orta</li><li><b>Firebase</b> Orta</li><li><b>Microsoft 365</b> Word · Excel · PowerPoint</li></ul></div>' +
        '</div>' +
        '<div class="colC">' +
        '<div class="blk" data-a="up" style="--d:.2s"><span class="lbl">Liderlik</span><p><b>MOLA</b> (Mimari Oluşum Atölyesi) öğrenci topluluğunun kurulmasına ve büyümesine liderlik ettim: konferans, sempozyum, teknik gezi ve sergiler.</p><p style="margin-top:8px"><b>ACKaraca Limited</b> (İngiltere): bir yıl çevrim içi perakende, ardından yazılım ve mimari faaliyetler.</p></div>' +
        '<div class="blk" data-a="up" style="--d:.3s"><span class="lbl">Yapay zekâ</span><p>Claude ve ChatGPT başta olmak üzere tasarım, görselleştirme, modelleme, yazılım ve araştırmada yapay zekâ araçlarını iş akışına entegre ediyorum.</p></div>' +
        '<div class="blk" data-a="up" style="--d:.4s"><span class="lbl">Diller</span><ul class="dl"><li><b>Türkçe</b> ana dil</li><li><b>İngilizce</b> B1–B2</li></ul></div>' +
        '</div>' +
        foot('Yetkinlikler', n),
    };
  };

  T.toc = (n) => {
    const row = (pr) => '<a class="row" href="#' + pr.first + '" data-go="' + pr.first + '" data-a="up" style="--d:' + (0.08 * pr.seq) + 's"><span class="k">' + pad(pr.seq) + '</span><div><b>' + esc(pr.p.title) + '</b><small>' + esc(pr.p.subtitle) + ' · ' + esc(pr.p.term || '') + '</small></div><span class="p">' + pad(pr.first) + '</span></a>';
    const a = proj.filter((x) => x.kind === 'akademik').map(row).join('');
    const o = proj.filter((x) => x.kind === 'otel').map(row).join('');
    const th = proj.map((pr) => (pr.p.hero ? img(pr.p, pr.p.hero, { a: 'zoom', d: 0.4 + pr.seq * 0.05, thumb: true }) : '')).join('');
    return {
      cls: 'toc',
      html: run('<b>ACK</b> &nbsp; Portfolyo', 'İçindekiler') +
        '<div class="grid"><div><div class="lbl" data-a="left">Bölüm 01</div><h2 data-a="up">Akademik Projeler</h2>' + a + '</div>' +
        '<div><div class="lbl" data-a="left">Bölüm 02</div><h2 data-a="up">Otel Projeleri</h2>' + o + '</div></div>' +
        '<div class="thumbs">' + th + '</div>' + foot('İçindekiler', n),
    };
  };

  T.divider = (n, pg) => {
    const isO = pg.kind === 'otel';
    const pool = allPool(pg.kind);
    const sel = isO ? [['fantasia','hero'],['ephesia','drone'],['oya','hero'],['ephesia','hero'],['smyrna','hero']] : null;
    const pickO = (s, w) => { const p = P[s]; if (!p) return null; const it = w === 'hero' ? p.hero : (p.visuals || []).find((v) => v.file.indexOf(w) === 0); return it ? { p, it } : null; };
    const strip = [0, 1, 2, 3, 4].map((i) => { const e = isO ? pickO(sel[i][0], sel[i][1]) || pool[i % pool.length] : pool[Math.floor((i + 0.5) * pool.length / 5) % Math.max(1, pool.length)]; return e ? img(e.p, e.it, { a: 'maskv', d: 0.15 * i, thumb: true }) : ''; }).join('');
    return {
      cls: 'dark divider' + (isO ? ' navy' : ''),
      html: run('<b>ACK</b> &nbsp; Portfolyo', 'Bölüm ' + (isO ? '02' : '01')) +
        '<div class="desc"><div class="redbar" data-a="line"></div><p data-a="up" style="--d:.2s;margin-top:16px;font-size:14.5px;line-height:1.7">' +
        (isO ? '2026’da Betemu Mimarlık bünyesinde 15’ten fazla otel, hostel ve pansiyon yapısının rölövesini aldım ve yangın tedbirleri planlarını çizdim. Bu bölümde, mevcut durumun çizime dökülmesini ve yangın güvenliği paftalarını gösteren beş çalışma yer alıyor.' :
          'Mimarlık eğitimim boyunca stüdyo ortamında geliştirdiğim beş proje: farklı ölçek, program ve bağlamlarda tasarım düşüncesinin gelişimi.') + '</p></div>' +
        '<div class="num" data-a="up">' + (isO ? '02' : '01') + '</div>' +
        '<div class="ttl"><div class="lbl" data-a="left">' + (isO ? 'Profesyonel çalışmalar' : 'Stüdyo çalışmaları') + '</div><div class="h-l" data-a="up" style="--d:.12s;margin-top:12px">' + pg.title + '</div></div>' +
        '<div class="strip">' + strip + '</div>' + foot(pg.title, n),
    };
  };

  /* --- akademik proje: hero --- */
  T.ph = (n, pg) => {
    const p = pg.p;
    const tools = (p.tools || []).slice(0, 5).map((t) => '<span data-a="left">' + esc(t) + '</span>').join('');
    const meta = [['Dönem', p.term], ['Ders', p.code], ['Yer', p.place || p.typology], ['Tür', p.typology || p.subtitle]].filter((m) => m[1]);
    return {
      cls: 'dark ph' + (p.hero && p.hero.tone === 'light' ? ' lightbg' : '') + (p.hero && p.hero.fit === 'right' ? ' bpr' : ''),
      html:
        '<div class="bg">' + (p.hero ? '<img class="fill kb" data-src="' + esc(src(p, p.hero.file)) + '" alt="' + esc(p.title) + '" decoding="async">' : '') + '</div><div class="grad"></div>' +
        '<div class="no" data-a="down"><b>' + pad(pg.idx) + '</b><span><em>Akademik proje</em>' + pad(pg.idx) + ' / ' + pad(pg.total) + '</span></div>' +
        '<div class="tools">' + tools + '</div>' +
        '<div class="tt"><h1 data-a="up" style="--d:.15s">' + esc(p.title) + '</h1><div class="sub" data-a="up" style="--d:.3s">' + esc(p.subtitle) + '</div></div>' +
        '<div class="meta" data-a="up" style="--d:.45s">' + meta.map((m) => '<div><small>' + m[0] + '</small><span>' + esc(m[1]) + '</span></div>').join('') + '</div>' +
        '<div class="pgn">' + pad(n) + ' / ' + pad(TOTAL) + '</div>',
    };
  };

  /* --- akademik proje: kavram --- */
  T.pc = (n, pg) => {
    const p = pg.p;
    const imgs = (p.concept_imgs || []).slice(0, 3);
    const wide = false;
    const facts = (p.facts || []).slice(0, 4).map((f) => '<div><small>' + esc(f.k) + '</small><span>' + esc(f.v) + '</span></div>').join('');
    return {
      cls: 'pc' + (wide ? ' wd' : ''),
      html:
        run('<b>' + pad(pg.idx) + '</b> &nbsp; ' + esc(p.title), 'Kavram') +
        '<div class="left"><div class="lbl" data-a="left">' + pad(pg.idx) + ' — Kavram</div><h2 data-a="up">' + esc(p.title) + '</h2>' +
        '<div class="sum" data-a="up" style="--d:.1s">' + esc(p.summary) + '</div>' +
        '<div class="con" data-a="up" style="--d:.2s"><span class="q">”</span><div class="serif">' + esc(p.concept) + '</div></div>' +
        '<div class="facts" data-a="up" style="--d:.3s">' + facts + '</div></div>' +
        '<div class="right"><div class="imgs pk">' + pack(p, imgs, 647, 626, { gap: 12 }) + '</div></div>' +
        foot(kindName(p.kind) + ' · ' + esc(p.title), n),
    };
  };

  /* --- akademik proje: çizimler --- */
  T.pd = (n, pg) => {
    const p = pg.p;
    let dr = (p.drawings || []).slice(0, 6);
    const si = dr.findIndex((x) => x.w / x.h > 5);
    let strip = false;
    if (si >= 0 && dr.length === 4) { const s = dr.splice(si, 1)[0]; dr.push(s); strip = true; }
    return {
      cls: 'pd grey',
      html:
        run('<b>' + pad(pg.idx) + '</b> &nbsp; ' + esc(p.title), 'Çizimler') +
        '<div class="hd"><div><div class="lbl" data-a="left">' + pad(pg.idx) + ' — Çizimler</div><h2 data-a="up">Plan · kesit · pafta</h2></div><div class="r" data-a="fade">' + esc(p.code || '') + '<br>' + esc(p.term || '') + '</div></div>' +
        '<div class="area pk">' + pack(p, dr, 1019, 592, { gap: 14 }) + '</div>' +
        foot(kindName(p.kind) + ' · ' + esc(p.title), n),
    };
  };

  /* --- akademik proje: görseller --- */
  T.pv = (n, pg) => {
    const p = pg.p;
    const v = (p.visuals || []).slice(0, 7);
    return {
      cls: 'dark pv',
      html:
        '<div class="mos n' + v.length + '">' + v.map((it, i) => (/^(axo|plan|kesit)_/.test(it.file) ? img(p, it, { a: 'zoom', d: 0.1 + i * 0.12, ovl: false, contain: true, cls: 'zoomy lightfig' }) : img(p, it, { a: 'zoom', d: 0.1 + i * 0.12, ovl: true, sh: true, cls: 'zoomy' }))).join('') + '</div>' +
        '<div class="band"></div><div class="tl2 lbl" style="color:#fff;top:24px;left:52px;position:absolute;z-index:6;font:500 9.5px var(--f-mono);letter-spacing:.2em;text-transform:uppercase;text-shadow:0 1px 6px rgba(0,0,0,.6)"><b style="color:var(--red);font-weight:500">' + pad(pg.idx) + '</b> &nbsp; ' + esc(p.title) + ' — Görseller</div>' +
        '<div class="foot on-dark" style="z-index:7;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7)"><span></span><span class="n" style="text-shadow:0 1px 8px rgba(0,0,0,.7)">' + pad(n) + '</span></div>',
    };
  };

  /* --- otel: kapak --- */
  T.ho = (n, pg) => {
    const p = pg.p;
    const meta = [['Tür', p.typology || p.subtitle], ['Yer', p.place], ['Çalışma', p.code], ['Yıl', p.term]].filter((m) => m[1]);
    return {
      cls: 'navy ho',
      html:
        '<div class="bg" style="' + (p.hero && p.hero.bg ? 'background:' + esc(p.hero.bg) : '') + '">' + (p.hero ? '<img class="fill kb2" data-src="' + esc(src(p, p.hero.file)) + '" alt="' + esc(p.title) + '" decoding="async">' : '') + '</div><div class="grid-lines"></div><div class="grad"></div>' +
        '<div class="no" data-a="down"><b>' + pad(pg.idx) + '</b><span>Otel projesi ' + pad(pg.idx) + ' / ' + pad(pg.total) + '</span></div>' +
        '<div class="tag" data-a="fade">' + esc(p.code || '') + '<br>' + esc(p.place || '') + '</div>' +
        '<div class="tt"><h1 data-a="up" style="--d:.15s">' + esc(p.title) + '</h1><div class="sub" data-a="up" style="--d:.28s">' + esc(p.subtitle) + '</div><p data-a="up" style="--d:.4s">' + esc(p.summary) + '</p></div>' +
        '<div class="meta" data-a="up" style="--d:.5s">' + meta.map((m) => '<div><small>' + m[0] + '</small><span>' + esc(m[1]) + '</span></div>').join('') + '</div>' +
        '<div class="foot"><span></span><span class="n">' + pad(n) + '</span></div>',
    };
  };

  /* --- otel: planlar --- */
  T.hp = (n, pg) => {
    const p = pg.p;
    const pl = (p.drawings || []).slice(0, 6);
    const ph = (p.visuals || []).slice(0, 2);
    const all = pl.concat(pl.length < 6 ? ph.slice(0, 6 - pl.length) : []);
    return {
      cls: 'hp',
      html:
        run('<b>' + pad(pg.idx) + '</b> &nbsp; ' + esc(p.title), 'Planlar') +
        '<div class="head"><div><div class="lbl" data-a="left">' + pad(pg.idx) + ' — Kat planları</div><h2 data-a="up">' + esc(p.title) + '</h2></div><p data-a="fade">' + esc(p.concept) + '</p></div>' +
        '<div class="plans pk">' + pack(p, all, 1019, 568, { gap: 12 }) + '</div>' + foot(kindName('otel') + ' · ' + esc(p.title), n),
    };
  };

  /* --- süreç sayfası --- */
  T.proc = (n) => {
    const pr = (D.process && D.process.images) || [];
    const fallback = [];
    ORDER.otel.forEach((s) => { const p = P[s]; if (p && p.drawings && p.drawings[0]) fallback.push({ p, it: p.drawings[0] }); });
    const tiles = pr.length ? pr.map((it) => ({ p: { slug: '_process', title: 'Arşiv' }, it })) : fallback;
    const steps = [
      ['Arşiv incelemesi', 'Mimari, statik ve tesisat projelerinin taranmış arşivinin okunması.'],
      ['Röleve', 'Mevcut durumun yapı üzerinde doğrulanması ve çizime aktarılması.'],
      ['CAD çizimi', 'Kat planlarının AutoCAD’de standart katman düzeniyle yeniden çizilmesi.'],
      ['Yangın tedbirleri', 'Çıkışlar, yangın dolapları, dedektörler ve alarm elemanlarının lejantla işlenmesi.'],
      ['Pafta ve teslim', 'Vaziyet, bodrum, zemin, normal kat ve çatı planlarının paftalanması.'],
    ];
    return {
      cls: 'proc',
      html:
        run('<b>ACK</b> &nbsp; Portfolyo', 'Çalışma yöntemi') +
        '<div class="colL"><div class="lbl" data-a="left">Pratik — 15+ otel çizimi</div><h2 data-a="up">Arşivden pafta’ya</h2>' +
        '<p data-a="up" style="--d:.1s">15’ten fazla otelde izlenen hat, seçili beş çalışmada da aynıdır: eski arşiv çizimlerinden başlayıp, doğrulanmış röleve ile standart bir yangın tedbirleri paftasına.</p>' +
        '<div class="steps">' + steps.map((s, i) => '<div class="step" data-a="up" style="--d:' + (0.2 + i * 0.08) + 's"><i>' + pad(i + 1) + '</i><div><b>' + s[0] + '</b><span>' + s[1] + '</span></div></div>').join('') + '</div></div>' +
        '<div class="coll pk">' + pack(null, tiles.slice(0, 6).map((e) => ({ p: e.p, it: e.it })), 641, 636, { gap: 12 }) + '</div>' +
        foot('Çalışma yöntemi', n),
    };
  };

  /* --- mozaik --- */
  T.mosaic = (n) => {
    const pool = allPool('all');
    const dark = [];
    ORDER.otel.forEach((s) => { const p = P[s]; if (p && p.hero) dark.push({ p, it: p.hero }); });
    const all = pool.filter((e) => !dark.some((d) => d.it === e.it)).concat(dark);
    const tiles = [];
    for (let i = 0; i < 32; i++) { const e = all[(i * 7) % Math.max(1, all.length)]; if (e) tiles.push(img(e.p, e.it, { a: 'zoom', d: (i % 8) * 0.05 + Math.floor(i / 8) * 0.07, thumb: true })); }
    return {
      cls: 'dark mosaic',
      html: '<div class="tiles">' + tiles.join('') + '</div><div class="veil"></div>' +
        '<div class="tx"><div class="lbl" data-a="left">Seçki</div><div class="h-l" data-a="up">Çizgiden<br>mekâna</div>' +
        '<p data-a="up" style="--d:.2s;font-size:14px">Plan, kesit, maket ve render: on projenin ortak dili.</p></div>' +
        '<div class="foot"><span></span><span class="n">' + pad(n) + '</span></div>',
    };
  };

  /* --- son sayfa --- */
  T.end = (n) => {
    const e = (P.tasarim8 && P.tasarim8.hero) ? { p: P.tasarim8, it: P.tasarim8.hero } : allPool('akademik')[0];
    return {
      cls: 'dark end',
      html:
        (e ? '<div class="photo">' + img(e.p, e.it, { cls: 'kb2', style: 'position:absolute;inset:0' }) + '<div class="shade"></div></div>' : '') +
        '<div class="badge" style="position:absolute;left:52px;top:54px;display:flex;align-items:center;gap:14px" data-a="down"><span class="ack"><span>ACK</span></span><span class="lbl" style="color:#EDEBE6">Mimarlık Portfolyosu · 2026</span></div>' +
        '<div class="big" data-a="up">Birlikte<br><em>çalışalım.</em></div>' +
        '<div class="cc"><div data-a="up" style="--d:.2s"><small>İsim</small><span>' + ME.name + '</span></div>' +
        '<div data-a="up" style="--d:.28s"><small>E-posta</small><span>' + ME.mail + '</span></div>' +
        '<div data-a="up" style="--d:.36s"><small>Web</small><span>' + ME.web + '</span></div>' +
        '<div data-a="up" style="--d:.44s"><small>LinkedIn</small><span>in/ahmet-cem-karaca</span></div></div>' +
        '<div class="foot"><span>Teşekkürler</span><span class="n">' + pad(n) + '</span></div>',
    };
  };

  /* ---------- DOM kurulumu ---------- */
  const stage = $('#stage');
  const root = document.documentElement;
  const pws = [];
  pages.forEach((pg, i) => {
    const pw = document.createElement('div');
    pw.className = 'pw';
    pw.dataset.n = pad(i + 1) + ' · ' + pg.title;
    pw.dataset.state = 'after';
    pw.innerHTML = '<div class="page" data-title="' + esc(pg.title) + '"></div>';
    stage.appendChild(pw);
    pws.push(pw);
  });
  // Sayfalar ilk ihtiyaçta kurulur: kırk sayfanın pafta yerleşimini açılışta hesaplamak ana iş parçacığını saniyelerce kilitliyordu.
  function render(i) {
    const pg = pws[i].firstElementChild;
    if (pg.dataset.r) return;
    pg.dataset.r = '1';
    const t = T[pages[i].type](i + 1, pages[i]);
    pg.className = 'page ' + t.cls + (pg.classList.contains('is-active') ? ' is-active' : '');
    pg.innerHTML = t.html;
    // otomatik kademeli gecikme
    pg.querySelectorAll('[data-a]').forEach((el, k) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (0.05 + Math.min(k, 12) * 0.06).toFixed(2) + 's'); });
  }

  /* ---------- görsel yükleme ---------- */
  // prio: 'cur' görünen sayfa (kapak görseli öne alınır), 'near' gizli komşu sayfa (düşük öncelik).
  function loadPage(i, prio) {
    const pw = pws[i]; if (!pw) return;
    render(i);
    pw.querySelectorAll('img[data-src]').forEach((im) => {
      if (prio === 'near') im.fetchPriority = 'low';
      else if (prio === 'cur' && im.classList.contains('fill')) im.fetchPriority = 'high';
      im.src = im.dataset.src; im.removeAttribute('data-src');
    });
  }
  function loadAll() { pws.forEach((_, i) => loadPage(i)); }
  const pause = () => (window.scheduler && window.scheduler.yield ? window.scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
  let warmId = 0;
  // Komşu sayfalar, sayfa geçişi bittikten sonra ve aralarda tarayıcıya nefes aldırarak hazırlanır.
  async function warm(i) {
    const id = ++warmId;
    await new Promise((r) => setTimeout(r, 1100));
    for (const k of [i + 1, i - 1, i + 2]) {
      if (id !== warmId || mode !== 'present') return;
      loadPage(k, 'near');
      await pause();
    }
  }
  // Kaydır/ızgara modunda sayfalar yalnızca görünüme yaklaşınca kurulur ve görselleri iner.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    if (mode === 'present') return;
    es.forEach((e) => { if (e.isIntersecting) loadPage(pws.indexOf(e.target)); });
  }, { rootMargin: '60% 0px' }) : null;
  function watch() { if (!io) { loadAll(); return; } io.disconnect(); pws.forEach((pw) => io.observe(pw)); }

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  function countUp(pg) {
    if (calm.matches) return;
    pg.querySelectorAll('[data-count]').forEach((el) => {
      const to = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now(), dur = 1400;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = (to > 1000 ? 2000 + Math.round((to - 2000) * e) : Math.round(to * e)) + (k >= 1 ? suf : ''); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  /* ---------- görsel büyütme ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Görsel büyütme — kapatmak için tıklayın veya Esc');
  lb.innerHTML = '<img alt="" decoding="async"><div class="cap"></div>';
  document.body.appendChild(lb);
  function openLB(im) {
    let s = im.getAttribute('src') || '';
    s = s.replace(/assets\/_thumbs\/([a-z0-9]+)__/, 'assets/$1/');
    const big = lb.querySelector('img');
    big.removeAttribute('src'); // yoksa yenisi inene kadar bir önceki görsel görünür
    big.src = s;
    big.alt = im.alt || '';
    lb.querySelector('.cap').textContent = im.alt || '';
    lb.classList.add('on');
  }
  function closeLB() { lb.classList.remove('on'); }
  lb.addEventListener('click', closeLB);

  /* ---------- gezinme ---------- */
  let cur = 0, mode = PRINT ? 'print' : 'present', dir = 'next';
  const body = document.body;
  body.dataset.mode = root.dataset.mode = mode;

  function setStates(prev) {
    pws.forEach((pw, i) => {
      const pg = pw.firstElementChild;
      let st = i < cur ? 'before' : i > cur ? 'after' : 'active';
      if (i === prev && prev !== cur) st = 'leaving';
      pw.dataset.state = mode === 'present' ? st : 'active';
      pw.classList.toggle('cur', i === cur);
      if (mode === 'present') { const was = pg.classList.contains('is-active'); pg.classList.toggle('is-active', i === cur); if (i === cur && !was) countUp(pg); }
      else pg.classList.add('is-active');
    });
  }
  function go(i, instant) {
    i = Math.max(0, Math.min(TOTAL - 1, i));
    if (i === cur && !instant) return;
    const prev = cur;
    dir = i >= cur ? 'next' : 'prev';
    body.dataset.dir = dir;
    cur = i;
    loadPage(i, 'cur');
    void pws[i].offsetWidth; // yeni kurulan sayfa bir kez başlangıç hâlinde stillenmeli, yoksa giriş animasyonu oynamaz
    setStates(prev);
    if (mode === 'present') warm(i);
    if (prev !== cur) setTimeout(() => { pws.forEach((pw, k) => { if (pw.dataset.state === 'leaving') pw.dataset.state = k < cur ? 'before' : 'after'; }); }, 1000);
    updateHUD();
    history.replaceState(null, '', '#' + (cur + 1));
  }

  /* ---------- ölçekleme ---------- */
  function fit() {
    const W = root.clientWidth, H = window.innerHeight; // clientWidth kaydırma çubuğunu saymaz; innerWidth ile ızgara bir sütun eksik diziliyordu
    if (mode === 'present') {
      const s = Math.min((W - 24) / 1123, (H - 24) / 794);
      root.style.setProperty('--s', s.toFixed(4));
      pws.forEach((pw) => { pw.style.width = ''; pw.style.height = ''; });
    } else if (mode === 'scroll') {
      const s = Math.min(1.25, (W - 40) / 1123);
      root.style.setProperty('--s', s.toFixed(4));
      pws.forEach((pw) => { pw.style.width = 1123 * s + 'px'; pw.style.height = 794 * s + 'px'; });
    } else if (mode === 'grid') {
      const cols = W < 700 ? 2 : W < 1100 ? 3 : 4;
      const s = Math.min(0.42, (W - 66 - (cols - 1) * 22) / cols / 1123); // 64 dolgu + 2 px pay: yuvarlama son sütunu alt satıra atmasın
      root.style.setProperty('--s', s.toFixed(4));
      pws.forEach((pw) => { pw.style.width = 1123 * s + 'px'; pw.style.height = 794 * s + 'px'; });
    } else if (mode === 'print') {
      pws.forEach((pw) => { pw.style.width = ''; pw.style.height = ''; });
    }
  }

  /* ---------- HUD ---------- */
  const hud = document.createElement('div');
  hud.className = 'hud';
  const I = {
    prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg>',
    scroll: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>',
    pres: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8M12 17v4"/></svg>',
  };
  hud.innerHTML =
    '<div class="bar-hud">' +
    '<button id="b-prev" title="Önceki (←)" aria-label="Önceki sayfa">' + I.prev + '</button>' +
    '<div class="pos" id="pos"></div>' +
    '<button id="b-next" title="Sonraki (→)" aria-label="Sonraki sayfa">' + I.next + '</button><span class="sep opt"></span>' +
    '<button id="b-pres" class="opt on" title="Sunum modu">' + I.pres + 'Sunum</button>' +
    '<button id="b-scroll" class="opt" title="Kaydırmalı görünüm (S)">' + I.scroll + 'Kaydır</button>' +
    '<button id="b-grid" class="opt" title="Genel bakış (G)">' + I.grid + 'Izgara</button><span class="sep opt"></span>' +
    '<button id="b-play" class="opt" title="Otomatik oynat (P)">' + I.play + '<span>Oynat</span></button>' +
    '<button id="b-full" class="opt" title="Tam ekran (F)" aria-label="Tam ekran">' + I.full + '</button>' +
    '<a id="b-pdf" href="' + esc(BASE + (D.pdf || 'Ahmet_Cem_Karaca_Portfolyo.pdf')) + '" target="_blank" rel="noopener" title="Hazır PDF’i yeni sekmede aç">' + I.pdf + 'PDF</a></div>';
  document.body.appendChild(hud);
  const top = document.createElement('div');
  top.className = 'topbar';
  top.innerHTML = '<a class="brand" href="/" title="ackaraca.me ana sayfa"><span class="ack"><span>ACK</span></span><span>' + ME.name + ' · Portfolyo</span></a><div id="ttl"></div>';
  document.body.appendChild(top);
  const prog = document.createElement('div'); prog.className = 'prog'; document.body.appendChild(prog);
  const toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast);
  const hint = document.createElement('div'); hint.className = 'hint'; hint.textContent = window.matchMedia('(pointer: coarse)').matches ? 'Sola / sağa kaydırarak gezin · görsele dokunarak büyüt' : '← → ile gezin · G genel bakış · F tam ekran'; document.body.appendChild(hint);
  setTimeout(() => hint.classList.add('hide'), 5000);

  toast.setAttribute('role', 'status');
  let sayT;
  function say(m, ms) { toast.textContent = m; toast.classList.add('show'); clearTimeout(sayT); sayT = setTimeout(() => toast.classList.remove('show'), ms || 3500); }
  function updateHUD() {
    $('#pos').innerHTML = '<b>' + pad(cur + 1) + '</b> / ' + pad(TOTAL) + ' &nbsp; ' + esc(pages[cur].title);
    $('#ttl').textContent = pages[cur].title;
    prog.style.width = (((cur + 1) / TOTAL) * 100).toFixed(2) + '%';
  }
  let hideT;
  function wake() { hud.classList.remove('hide'); top.classList.remove('hide'); clearTimeout(hideT); if (mode === 'present') hideT = setTimeout(() => { if (hud.querySelector(':focus-visible')) { wake(); return; } hud.classList.add('hide'); top.classList.add('hide'); }, 3200); }
  hud.addEventListener('focusin', wake);
  ['mousemove', 'touchstart', 'keydown'].forEach((e) => window.addEventListener(e, wake, { passive: true }));

  /* ---------- mod ---------- */
  function setMode(m) {
    if (m === mode) return;
    mode = m;
    body.dataset.mode = root.dataset.mode = m;
    ['pres', 'scroll', 'grid'].forEach((k) => $('#b-' + k).classList.toggle('on', (k === 'pres' ? 'present' : k) === m));
    if (m !== 'present') { stopPlay(); hud.classList.remove('hide'); top.classList.remove('hide'); }
    // Izgarada her sayfa tek bir düğme gibi davranır; içindeki bağlantılar odak almaz.
    pws.forEach((pw) => {
      pw.firstElementChild.inert = m === 'grid';
      if (m === 'grid') { pw.tabIndex = 0; pw.setAttribute('role', 'button'); pw.setAttribute('aria-label', pw.dataset.n); }
      else { pw.removeAttribute('tabindex'); pw.removeAttribute('role'); pw.removeAttribute('aria-label'); }
    });
    fit(); setStates(-1);
    if (m === 'present') { if (io) io.disconnect(); } else watch();
    if (m === 'present') { window.scrollTo(0, 0); go(cur, true); }
    else requestAnimationFrame(() => { pws[cur].scrollIntoView({ block: m === 'grid' ? 'center' : 'start' }); });
    wake();
  }
  pws.forEach((pw, i) => pw.addEventListener('click', (e) => {
    if (mode === 'grid') { cur = i; setMode('present'); go(i, true); return; }
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(+g.dataset.go - 1); if (mode !== 'present') pws[cur].scrollIntoView({ block: 'start' }); }
  }));

  /* ---------- oynat ---------- */
  let playT = null;
  function stopPlay() { if (playT) { clearInterval(playT); playT = null; $('#b-play').classList.remove('on'); $('#b-play').innerHTML = I.play + '<span>Oynat</span>'; } }
  function startPlay() {
    if (mode !== 'present') setMode('present');
    $('#b-play').classList.add('on'); $('#b-play').innerHTML = I.pause + '<span>Durdur</span>';
    playT = setInterval(() => { if (cur >= TOTAL - 1) { stopPlay(); return; } go(cur + 1); }, 6500);
  }

  /* ---------- olaylar ---------- */
  $('#b-prev').onclick = () => { stopPlay(); go(cur - 1); };
  $('#b-next').onclick = () => { stopPlay(); go(cur + 1); };
  $('#b-pres').onclick = () => setMode('present');
  $('#b-scroll').onclick = () => setMode('scroll');
  $('#b-grid').onclick = () => setMode(mode === 'grid' ? 'present' : 'grid');
  $('#b-play').onclick = () => (playT ? stopPlay() : startPlay());
  $('#b-full').onclick = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen(); };
  // Bağlantının kendisi açar: gecikmeli window.open açılır pencere engelleyicisine takılıyordu.
  $('#b-pdf').onclick = () => say('Hazır PDF açılıyor. Kendiniz üretmek için: Yazdır → “PDF olarak kaydet”, kenar boşluğu: Yok, arka plan grafikleri: Açık.', 5200);
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (lb.classList.contains('on')) { if (k === 'Escape') closeLB(); return; } // büyütme açıkken arkadaki sayfa çevrilmesin
    const onControl = e.target.closest && e.target.closest('button,a,[role=button]');
    if (onControl && (k === ' ' || k === 'Enter')) { if (e.target.classList.contains('pw')) { e.preventDefault(); e.target.click(); } return; } // odaklı düğme kendi işini yapsın
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') { if (mode === 'present') { e.preventDefault(); stopPlay(); go(cur + 1); } }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') { if (mode === 'present') { e.preventDefault(); stopPlay(); go(cur - 1); } }
    else if (k === 'Home') { if (mode === 'present') go(0); else window.scrollTo(0, 0); }
    else if (k === 'End') { if (mode === 'present') go(TOTAL - 1); else window.scrollTo(0, 1e9); }
    else if (k === 'g' || k === 'G') setMode(mode === 'grid' ? 'present' : 'grid');
    else if (k === 's' || k === 'S') setMode(mode === 'scroll' ? 'present' : 'scroll');
    else if (k === 'f' || k === 'F') $('#b-full').click();
    else if (k === 'p' || k === 'P') $('#b-play').click();
    else if (k === 'Escape') { if (lb.classList.contains('on')) closeLB(); else if (mode !== 'present') setMode('present'); }
  });
  let wheelLock = 0, wheelLast = 0;
  window.addEventListener('wheel', (e) => {
    if (mode !== 'present' || lb.classList.contains('on')) return;
    const t = Date.now(), fresh = t - wheelLast > 180; wheelLast = t;
    // Dokunmatik yüzey parmak kalktıktan sonra da kaydırma gönderir; yalnızca yeni bir hareket (ya da uzun süren tek hareket) sayfa çevirir.
    if (Math.abs(e.deltaY) < 20 || t - wheelLock < (fresh ? 450 : 1500)) return;
    wheelLock = t; stopPlay(); go(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });
  let tx = null, ty = 0;
  // İki parmak (yakınlaştırma) ve dikey kaydırma sayfa çevirmez.
  window.addEventListener('touchstart', (e) => { tx = e.touches.length === 1 ? e.touches[0].clientX : null; ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', (e) => { if (tx == null || mode !== 'present' || lb.classList.contains('on')) return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { stopPlay(); go(cur + (dx < 0 ? 1 : -1)); } tx = null; }, { passive: true });
  stage.addEventListener('click', (e) => {
    if (mode !== 'present' || e.target.closest('[data-go]') || e.target.closest('a')) return;
    const fi = e.target.closest('.pc .fig, .pd .fig, .pv .fig, .hp .fig, .proc .fig, .ph .bg');
    const imE = e.target.closest('.fig') && e.target.closest('.fig').querySelector('img');
    if (fi && imE && imE.getAttribute('src')) { openLB(imE); return; }
    const r = stage.getBoundingClientRect();
    stopPlay(); go(cur + (e.clientX > r.width / 2 ? 1 : -1));
  });
  // Kare başına tek yazım ve yalnızca görünen sayfada: kökte tutulunca her fare hareketi bütün belgeyi yeniden stilliyordu.
  let mxy = null;
  window.addEventListener('mousemove', (e) => {
    if (mode !== 'present' || calm.matches) return;
    const queued = mxy; mxy = [e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5];
    if (!queued) requestAnimationFrame(() => { const st = pws[cur].style; st.setProperty('--mx', mxy[0].toFixed(3)); st.setProperty('--my', mxy[1].toFixed(3)); mxy = null; });
  }, { passive: true });
  window.addEventListener('resize', fit);
  window.addEventListener('beforeprint', () => { loadAll(); body.dataset.prev = mode; });

  /* ---------- başlat ---------- */
  fit();
  if (PRINT) {
    loadAll();
    setStates(-1);
    const imgs = [...document.images];
    Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })))).then(() => { document.fonts && document.fonts.ready.then(() => { window.__ready = true; document.title = 'ready'; }); });
  } else {
    const h = parseInt((location.hash || '').slice(1), 10);
    cur = h > 0 && h <= TOTAL ? h - 1 : 0;
    go(cur, true);
    wake();
  }
  window.__portfolio = { go, setMode, pages, TOTAL };
})();
