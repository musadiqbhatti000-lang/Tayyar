/* Tayyar prototype: student app + vendor counter. Everything outside this browser is simulated. */

/* ================= setup ================= */
const kindOf = (name, def) => { for (const [re,k] of KIND_RULES) if (re.test(name)) return k; return def; };
OUTLETS.forEach(o => { let n = 0; o.cap0 = Math.max(3, Math.round(o.rate*0.6)); o.items = [];
  o.menu.forEach((s,si) => { s.items = s.items.map(m => { const opts = Array.isArray(m[1]) ? m[1].map(x => ({l:x[0], p:x[1]})) : null;
    const it = {id:o.id+':'+(n++), o:o.id, name:m[0], price:opts ? Math.min(...opts.map(x => x.p)) : m[1], opts, flav:m[2]||null, desc:m[3]||'', kind:kindOf(m[0], s.k), sec:si};
    o.items.push(it); return it; }); }); });
const O = Object.fromEntries(OUTLETS.map(o => [o.id,o]));
const A = Object.fromEntries(AREAS.map(a => [a.id,a]));
const ITEM = Object.fromEntries(OUTLETS.flatMap(o => o.items.map(m => [m.id,m])));
const PAY = Object.fromEntries(PAYS.map(p => [p.id,p]));
const QUICK = ['Less spicy','Extra spicy','No mayo','No onions','No ice'];
const KHUE = {burger:32,roll:8,pizza:45,noodles:6,rice:42,curry:24,salad:110,samosa:85,churro:26,donut:330,icecream:340,coffee:28,shake:335,soda:200,chai:30,cookie:30,brownie:22,cake:340,pastry:36,fries:48,sandwich:95,paratha:42,chicken:26,dip:10,water:205};
function demand(t){ if (t<OPEN || t>=CLOSE) return 0; for (let i=1;i<PROFILE.length;i++){ const [a,fa] = PROFILE[i-1], [b,fb] = PROFILE[i]; if (t<=b) return fa+(fb-fa)*(t-a)/(b-a); } return 0; }
const COVER = {'afridi':'50% 50%','united-king':'50% 35%','yellow-taxi':'30% 30%','bamboo':'20% 50%','chuggs':'50% 22%','sarim':'50% 45%','gyroverse':'50% 75%','churro':'70% 60%','kebab-hut':'50% 50%','munch-lab':'50% 30%','pepsi-cafe':'50% 25%','sodavoda':'60% 72%','woks':'50% 50%'};
const ico = (k,size) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${ICON[k]}</svg>`;
const art = (k,size,cls,o) => `<span class="art ${cls||''}" style="background:hsl(${o ? o.hue : KHUE[k]} 88% 93%)">${ico(k,size)}${o && COVER[o.id] ? `<img class="cov" src="covers/${o.id}.jpg" alt="" style="object-position:${COVER[o.id]}" onerror="this.remove()">` : ''}${o ? `<span class="mono" style="background:hsl(${o.hue} 62% 36%)">${o.p}</span>` : ''}</span>`;

/* ================= state ================= */
let S, QC = {}, lastSave = 0;
const KEY = 'tayyar-proto-v3';
const realNow = () => { const d = new Date(); return d.getHours()*60 + d.getMinutes() + d.getSeconds()/60; };
const isOpen = () => S.t>=OPEN && S.t<CLOSE;
function fresh(){
  return { v:3, clock:770, t:770, live:false, ff:false, auto:true, rng:20261116, seq:100,
    orders:[], kit:{}, out:{'kebab-hut:3':true,'schokola:10':true}, vo:{},
    cart:[], user:null, vauth:false, vlang:'en', vsound:true, sound:true, cashStrike:false,
    view:{tab:'home', stack:[], orderId:null, pay:'easypaisa', slots:{}, sheet:null, mapArea:null, cat:'All', sort:false, q:'', err:'', erp:'', verr:false},
    vendorOutlet:'kebab-hut', layout:'both', demoOpen:false, just:null, notice:false, toast:null };
}
function rnd(){ S.rng = (S.rng + 0x6D2B79F5) | 0; let t = S.rng; t = Math.imul(t ^ t>>>15, t|1); t ^= t + Math.imul(t ^ t>>>7, t|61); return ((t ^ t>>>14)>>>0)/4294967296; }
function save(force){ const now = Date.now(); if (!force && now-lastSave < 1500) return; lastSave = now; try { localStorage.setItem(KEY, JSON.stringify({at:now, S})); } catch (e) {} }
function loadSaved(){ try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && j.S && j.S.v===3 && Date.now()-j.at < 3*3600e3) return j.S; } catch (e) {} return null; }
const cap = o => (S.vo[o.id] && S.vo[o.id].cap) || o.cap0;
const paused = o => !!(S.vo[o.id] && S.vo[o.id].paused);

/* ================= queue model ================= */
const slots = () => { const f = Math.ceil((S.t+4)/10)*10; return [0,1,2,3,4,5].map(i => f+i*10); };
const alive = x => x.status!=='cancelled' && x.status!=='rejected';
const load = (id,t) => S.orders.reduce((n,x) => n + (x.outlet===id && x.src==='app' && x.slot===t && alive(x) ? 1 : 0), 0);
const pend = id => S.orders.filter(x => x.outlet===id && (x.status==='received'||x.status==='preparing')).sort((a,b) => a.slot-b.slot || a.id-b.id);
const workOf = items => Math.max(.3, items.reduce((s,i) => s + i.qty*(WORK[i.kind] || 1), 0));
const sumWork = xs => xs.reduce((s,x) => s+x.work, 0);
function mkOrder(o, items, slot, pay, src, mine){
  const id = ++S.seq;
  const ord = {id, token:o.p+'-'+id, pin:String(1000+Math.floor(rnd()*9000)), outlet:o.id, items, total:items.reduce((s,i) => s+i.qty*i.price, 0), work:workOf(items), slot, pay, src, mine:!!mine, status:'received', placed:S.t, readyAt:null, late:false, issue:null};
  S.orders.push(ord); return ord;
}
function addBg(o, slot, src){
  const items = [], n = 1 + (rnd()<0.35 ? 1 : 0);
  for (let i=0;i<n;i++){ const m = o.items[Math.floor(rnd()*o.items.length)];
    items.push({iid:m.id, name:m.name + (m.opts ? ' · '+m.opts[0].l : '') + (m.flav ? ' · '+m.flav[Math.floor(rnd()*m.flav.length)] : ''), qty:1, price:m.opts ? m.opts[0].p : m.price, kind:m.kind, note:''}); }
  const x = mkOrder(o, items, slot, PAYS[Math.floor(rnd()*3)].id, src, false); x.placed = S.t-3; return x;
}
function seed(){
  const f = demand(S.t);
  for (const o of OUTLETS){
    S.kit[o.id] = 0;
    if (!f) continue;
    const sl = slots(), k = f*(o.pop/3);
    const nc = Math.round(o.rate*0.5*k*(0.7+rnd()*0.5));
    for (let j=0;j<nc;j++) addBg(o, S.t, 'counter');
    [0.9,0.55,0.28,0.1].forEach((w,i) => { const n = Math.min(cap(o), Math.round(cap(o)*w*k*(0.75+rnd()*0.4))); for (let j=0;j<n;j++) addBg(o, sl[i], 'app'); });
    const p = pend(o.id);
    if (p[0]){ p[0].status='ready'; p[0].readyAt=S.t; }
    if (p[1]) p[1].status='preparing';
    if (p[2]) p[2].status='preparing';
  }
}
function setReady(h){
  h.status = 'ready'; h.readyAt = S.t;
  if (h.mine) notify(`Order ${h.token} is ready. Collect it at the ${A[O[h.outlet].area].pickup} and give PIN ${h.pin}.`, 'ok');
}
function kitchen(o){
  const q = pend(o.id).filter(x => x.slot-10 <= S.t && !x.issue);
  let acc = S.kit[o.id] || 0;
  if (q.length){
    acc = Math.min(acc + o.rate/10, 4);
    while (q.length && acc >= q[0].work && q[0].placed <= S.t-1){ const h = q.shift(); acc -= h.work; setReady(h); }
    q.slice(0,2).forEach(x => x.status='preparing');
  } else acc = Math.min(acc,1);
  S.kit[o.id] = acc;
  for (const x of S.orders) if (x.outlet===o.id && !x.mine && x.status==='ready' && S.t >= x.readyAt+(x.src==='counter' ? 1 : 2+(x.id%3))) x.status='collected';
  const f = demand(S.t);
  if (f && pend(o.id).length < o.rate*2.5 && rnd() < Math.min(.95, o.pop*0.2*f)){
    if (rnd() < .6) addBg(o, S.t, 'counter');
    else if (!paused(o)){ const free = slots().slice(0,4).filter(t => load(o.id,t) < cap(o)); if (free.length) addBg(o, free[Math.min(free.length-1, Math.floor(rnd()*rnd()*4))], 'app'); }
  }
}
/* Estimate for a new order at a pickup time. Counts app and counter orders, weighted by how long each takes to make. */
function quoteSlot(o, slot, own){
  const p = pend(o.id), before = p.filter(x => x.slot<=slot), elig = slot-10 <= S.t;
  const rel = elig ? before : p.filter(x => x.slot===slot);
  const at = Math.max(S.t, slot-10) + Math.max(1, Math.ceil((sumWork(rel)+(own||1))*10/o.rate));
  return {ahead:before.length, slot, at, wait:at-S.t};
}
function quote(o){
  if (!isOpen()) return {closed:true, ahead:0, wait:0};
  if (paused(o)) return {paused:true, ahead:pend(o.id).length, wait:98};
  const ns = slots().find(t => load(o.id,t) < cap(o));
  return ns==null ? {full:true, ahead:pend(o.id).length, wait:99} : quoteSlot(o, ns, 1);
}
const qt = o => QC[o.id] || (QC[o.id] = quote(o));
function eta(ord){
  if (ord.status!=='received' && ord.status!=='preparing') return {ahead:0, at:ord.readyAt};
  const o = O[ord.outlet], p = pend(o.id), i = p.findIndex(x => x.id===ord.id), before = p.slice(0, Math.max(i,0));
  const elig = ord.slot-10 <= S.t, rel = elig ? before : before.filter(x => x.slot===ord.slot);
  return {ahead:before.length, at:Math.max(S.t, ord.slot-10) + Math.max(1, Math.ceil((sumWork(rel)+ord.work)*10/o.rate))};
}
const level = q => q.closed||q.paused ? {k:'off', n:0, t:'Not available'} : q.wait<=10 ? {k:'ok', n:1, t:'Short wait'} : q.wait<=18 ? {k:'warn', n:2, t:'Moderate wait'} : {k:'busy', n:3, t:'Long wait'};
function jumpTo(t, live, shift){
  const nt = Math.floor(t), d = nt - S.t;
  if (shift) for (const x of S.orders) if (x.mine && ['received','preparing','ready'].includes(x.status)){ x.slot += Math.round(d/10)*10; x.placed += d; if (x.readyAt!=null) x.readyAt += d; }
  S.clock = t; S.t = nt; S.live = !!live;
  S.orders = S.orders.filter(x => x.mine); S.kit = {};
  seed();
}
function minute(){
  if (S.auto) for (const o of OUTLETS) kitchen(o);
  for (const x of S.orders) if (x.mine && x.status==='ready' && S.t >= x.readyAt + HOLD + (x.late ? 10 : 0)){
    x.status = 'noshow';
    if (!PAY[x.pay].paid){ S.cashStrike = true; notify(`Order ${x.token} was not collected. Cash at pickup is now switched off for your account.`, 'bad'); }
    else notify(`Order ${x.token} was not collected in time, so it has been released.`, 'bad');
  }
  S.orders = S.orders.filter(x => x.mine || !(['collected','cancelled','rejected'].includes(x.status) && (x.readyAt==null ? x.slot : x.readyAt) < S.t-5));
}
function tick(){
  const prev = S.t;
  if (S.live) S.clock = realNow(); else S.clock += (S.ff ? 20 : 1)/60;
  if (S.clock >= 1440) S.clock -= 1440;
  const n = Math.floor(S.clock) - prev;
  if (n<0 || n>45){ jumpTo(S.clock, S.live, false); render(); return; }
  for (let i=1;i<=n;i++){ S.t = prev+i; minute(); }
  if (S.toast && Date.now()-S.toast.at > 9000){ S.toast = null; render(); }
  else if (n>0) render(); else { hands(); countdown(); }
}

/* ================= alerts ================= */
let AC = null;
function beep(n){
  if (!S.sound || !AC) return;
  try { const t0 = AC.currentTime; for (let i=0;i<(n||2);i++){ const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 880; o.connect(g); g.connect(AC.destination);
    g.gain.setValueAtTime(.0001, t0+i*.26); g.gain.exponentialRampToValueAtTime(.2, t0+i*.26+.02); g.gain.exponentialRampToValueAtTime(.0001, t0+i*.26+.2); o.start(t0+i*.26); o.stop(t0+i*.26+.22); } } catch (e) {}
}
function notify(msg, kind, quiet){ S.toast = {msg, kind:kind||'', at:Date.now()}; if (!quiet){ beep(kind==='bad' ? 3 : 2); try { if (navigator.vibrate) navigator.vibrate(200); } catch (e) {} } }

/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtT = t => { const h = Math.floor(t/60)%24, m = Math.floor(t)%60; return (h%12||12)+':'+String(m).padStart(2,'0')+(h>=12?' pm':' am'); };
const rs = n => 'Rs '+n.toLocaleString('en-PK');
const lkey = l => [l.id, l.opt==null ? '' : l.opt, l.flav||'', l.note||''].join('|');
const linePrice = l => { const m = ITEM[l.id]; return m.opts ? m.opts[l.opt||0].p : m.price; };
const lineName = l => { const m = ITEM[l.id]; return m.name + (m.opts ? ' · '+m.opts[l.opt||0].l : '') + (l.flav ? ' · '+l.flav : ''); };
const cartCount = () => S.cart.reduce((s,l) => s+l.qty, 0);
const cartTotal = () => S.cart.reduce((s,l) => s+l.qty*linePrice(l), 0);
const cartQty = id => S.cart.reduce((s,l) => s+(l.id===id ? l.qty : 0), 0);
function cartGroups(){ const g = []; for (const l of S.cart){ const o = O[ITEM[l.id].o]; let x = g.find(y => y.o===o); if (!x) g.push(x = {o, lines:[]}); x.lines.push(l); } return g; }
function addLine(n){ n.key = lkey(n); const ex = S.cart.find(l => l.key===n.key); if (ex) ex.qty += n.qty; else S.cart.push(n); }
const myOrders = () => S.orders.filter(x => x.mine).sort((a,b) => b.id-a.id);
const isActive = x => ['received','preparing','ready'].includes(x.status);
const myActive = () => myOrders().filter(isActive);
const modeLabel = () => S.live ? 'live' : S.ff ? 'fast-forward' : 'demo time';
const chev = '<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const plus = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const bars = l => `<span class="bars l${l.n}" aria-hidden="true"><span></span><span></span><span></span></span>`;
function chosenSlot(o){ const av = slots().filter(t => load(o.id,t) < cap(o)); const c = S.view.slots[o.id]; return av.includes(c) ? c : (av.length ? av[0] : null); }
function pills(q){
  if (q.closed) return '<span class="pl off">Closed</span>';
  if (q.paused) return '<span class="pl off">Not taking app orders</span>';
  if (q.full) return '<span class="pl busy">Pickup times full</span>';
  const l = level(q);
  return `<span class="pl num"><b>${q.ahead}</b> ahead</span><span class="pl ${l.k} num" title="${l.t}">${bars(l)}<b>${q.wait}</b> min</span>`;
}
function areaStats(a){ const os = OUTLETS.filter(o => o.area===a.id), qs = os.map(qt); return {os, queue:qs.reduce((s,q) => s+q.ahead, 0), best:qs.reduce((b,q) => q.wait<b.wait ? q : b, qs[0])}; }
function stepper(key, name){ const l = S.cart.find(x => x.key===key), q = l ? l.qty : 0, k = esc(key);
  return `<span class="stepper"><button data-act="dec:${k}" aria-label="Remove one ${esc(name)}">−</button><b class="num">${q}</b><button data-act="inc:${k}" aria-label="Add one ${esc(name)}">+</button></span>`; }
function cashRule(total){
  if (S.cashStrike) return 'Switched off after a missed pickup';
  if (total > CASH_LIMIT) return 'Only for orders up to '+rs(CASH_LIMIT);
  if (S.orders.some(x => x.mine && x.pay==='cash' && isActive(x))) return 'One unpaid cash order at a time';
  return '';
}

/* ================= student screens ================= */
function loginScreen(){
  return {bar:'Sign in', body:`<div style="text-align:center;padding:12px 0 0">${ico('burger',84)}<p class="h2" style="font-size:20px;margin-top:8px">Welcome to Tayyar</p><p class="sub">Sign in with your IBA ERP ID to order ahead from campus outlets.</p></div>
    <label class="field" for="erp">ERP ID<input id="erp" inputmode="numeric" autocomplete="off" placeholder="5-digit ERP ID" maxlength="5" value="${esc(S.view.erp)}"></label>
    ${S.view.err ? `<p class="err" role="alert">${esc(S.view.err)}</p>` : ''}
    <button class="btn" data-act="signin">Sign in</button><button class="btn ghost" data-act="demo-user">Use the demo account</button>
    <p class="note">Sign-in is simulated in this prototype. A real version would check the ID with the university, so that only students can order.</p>`};
}
function ocard(o){
  const q = S.view.q, hit = q && !o.name.toLowerCase().includes(q) ? o.items.find(m => m.name.toLowerCase().includes(q)) : null;
  return `<button class="ocard" data-act="outlet:${o.id}">${art(o.kind,62,'oc-art',o)}<span class="oc-name">${esc(o.name)}</span>
    <span class="oc-area">${esc(A[o.area].name)}</span>${hit ? `<span class="oc-hit">Has ${esc(hit.name)}</span>` : ''}<span class="pills">${pills(qt(o))}</span></button>`;
}
function homeBody(){
  const v = S.view, q = v.q, open = isOpen();
  let list = OUTLETS.filter(o => (v.cat==='All' || o.cat===v.cat) && (!q || (o.name+' '+o.tag+' '+o.cat+' '+A[o.area].name+' '+o.items.map(m => m.name).join(' ')).toLowerCase().includes(q)));
  const flat = v.sort || q || v.cat!=='All';
  if (v.sort) list = [...list].sort((a,b) => qt(a).wait - qt(b).wait);
  let h = `<div class="loc"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.8-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>IBA Main Campus · ${open ? OUTLETS.length+' outlets taking orders' : 'outlets closed right now'}</div>`;
  if (S.notice) h += `<div class="infobox">Campus outlets are closed at this hour, so you are seeing the 12:50 pm lunch peak instead. Use Demo controls at the top to change the time.</div>`;
  else if (!open) h += `<div class="infobox">Outlets take orders from 8 am to 8 pm.</div>`;
  for (const x of myActive().slice(0,2)){ const e = eta(x);
    h += `<button class="banner" data-act="track:${x.id}"><span class="tok">${x.token}</span><span style="flex:1;font-weight:600" class="num">${x.issue ? 'Needs your attention' : x.status==='ready' ? 'Ready for pickup now' : e.ahead+' ahead of you · ready about '+fmtT(e.at)}</span>${chev}</button>`; }
  h += `<div class="chips" role="group" aria-label="Food type">${CATS.map(c => `<button class="chip" data-act="cat:${c}" aria-pressed="${v.cat===c}">${esc(c)}</button>`).join('')}</div>`;
  if (!list.length) h += `<div class="empty">No outlet or dish matches your search. Try another word or clear the filters.</div><button class="btn ghost" data-act="clear">Clear search and filters</button>`;
  else if (flat) h += `<div class="sec-h"><p class="h2">${v.sort ? 'Shortest wait first' : list.length+' outlet'+(list.length>1?'s':'')}</p><button class="link" data-act="clear">Clear</button></div><div class="grid">${list.map(ocard).join('')}</div>`;
  else h += AREAS.map(a => { const os = list.filter(o => o.area===a.id); return os.length ? `<div class="sec-h"><div><p class="h2">${esc(a.name)}</p><p class="sub">${esc(a.where)}</p></div><button class="link" data-act="seeon:${a.id}">See on map</button></div><div class="grid">${os.map(ocard).join('')}</div>` : ''; }).join('');
  h += `<p class="note">“Ahead” counts app orders and counter orders together. Other customers, payments and kitchen progress are simulated.</p>`;
  return h;
}
function orow(o){ return `<button class="row" data-act="outlet:${o.id}">${art(o.kind,36,'',o)}<span class="row-main"><span class="row-name">${esc(o.name)}</span><span class="sub">${esc(o.tag)}</span><span class="pills" style="margin-top:4px">${pills(qt(o))}</span></span>${chev}</button>`; }
function mapBody(){
  const a = A[S.view.mapArea]; let h = '';
  if (!isOpen()) h += `<div class="infobox">Outlets take orders from 8 am to 8 pm.</div>`;
  if (a) h += `<div class="sec-h"><div><p class="h2">${esc(a.name)}</p><p class="sub">${esc(a.where)} · collect at ${esc(a.pickup)}</p></div><button class="link" data-act="mapreset">All areas</button></div><div class="list">${OUTLETS.filter(o => o.area===a.id).map(orow).join('')}</div>`;
  else h += `<div class="sec-h"><div><p class="h2">Food areas</p><p class="sub">Tap a pin or an area to see its outlets</p></div></div><div class="list">` + AREAS.map(a => { const st = areaStats(a), l = level(st.best);
    return `<button class="row" data-act="maparea:${a.id}">${art(st.os[0].kind,36)}<span class="row-main"><span class="row-name">${esc(a.name)}</span><span class="sub">${esc(a.where)} · ${st.os.length} outlet${st.os.length>1?'s':''}</span>
      <span class="pills" style="margin-top:4px">${st.best.closed ? '<span class="pl off">Closed</span>' : `<span class="pl num"><b>${st.queue}</b> in queue</span><span class="pl ${l.k} num">${bars(l)}from <b>${st.best.wait>=98 ? '–' : st.best.wait}</b> min</span>`}</span></span>${chev}</button>`; }).join('') + `</div>`;
  h += `<p class="note">Pin numbers show orders in the queue. Outlet positions on this map are approximate.</p>`;
  return h;
}
function mrow(m){
  const out = !!S.out[m.id], simple = !m.opts && !m.flav, n = cartQty(m.id);
  const priceTxt = m.opts ? m.opts.map(x => esc(x.l)+' '+rs(x.p)).join(' · ') : rs(m.price);
  const ctl = out ? '<span class="soldtag">Sold out</span>' : simple && n && S.cart.some(l => l.key===m.id+'|||') ? stepper(m.id+'|||', m.name)
    : `<button class="addbtn" data-act="add:${m.id}" aria-label="Add ${esc(m.name)}">${plus}${n ? `<span class="cnt num">${n}</span>` : ''}</button>`;
  return `<div class="mi${out?' out':''}">${art(m.kind,30)}<span class="row-main"><span class="mi-name">${esc(m.name)}</span>${m.desc ? `<span class="mi-desc">${esc(m.desc)}</span>` : ''}${m.flav ? `<span class="mi-desc">${m.flav.length} flavours</span>` : ''}<span class="price num">${priceTxt}</span></span>${ctl}</div>`;
}
function menuScreen(id){
  const o = O[id], q = qt(o), l = level(q);
  let h = `<div class="ohead">${art(o.kind,58,'',o)}<div style="min-width:0"><p class="sub">${esc(A[o.area].name)} · ${esc(o.tag)}</p><div class="pills">${pills(q)}</div>
    ${q.closed||q.full||q.paused ? '' : `<p class="sub num" style="margin-top:6px"><b style="color:var(--ink)">${l.t}.</b> Order now, ready by about <b style="color:var(--ink)">${fmtT(q.at)}</b></p>`}</div></div>`;
  if (q.paused) h += `<div class="infobox">This outlet has paused app orders for now. You can still browse the menu.</div>`;
  if (o.sample) h += `<div class="infobox">Sample menu. The real menu for this outlet has not been added yet.</div>`;
  if (o.menu.length>1) h += `<div class="chips secchips" role="group" aria-label="Menu sections">${o.menu.map((s,i) => `<button class="chip" data-act="sec:${i}">${esc(s.t)}</button>`).join('')}</div>`;
  h += o.menu.map((s,i) => `<div class="msec" id="sec-${i}"><h3>${esc(s.t)}</h3>${s.items.map(mrow).join('')}</div>`).join('');
  return {bar:o.name, body:h};
}
function sheetHtml(){
  const sh = S.view.sheet; if (!sh) return '';
  const m = ITEM[sh.id], price = m.opts ? m.opts[sh.opt].p : m.price;
  return `<div class="sheet-wrap" data-act="sheet-close"><div class="sheet" role="dialog" aria-label="${esc(m.name)}">
    <div class="sheet-h"><div><p class="h2">${esc(m.name)}</p><p class="sub">${esc(O[m.o].name)}${m.desc ? ' · '+esc(m.desc) : ''}</p></div><button class="xbtn" data-act="sheet-close" aria-label="Close">×</button></div>
    ${m.opts ? `<p class="eyebrow">Choose one</p><div class="chips wrap">${m.opts.map((x,i) => `<button class="chip num" data-act="sheet-opt:${i}" aria-pressed="${i===sh.opt}">${esc(x.l)} · ${rs(x.p)}</button>`).join('')}</div>` : ''}
    ${m.flav ? `<p class="eyebrow">Flavour</p><div class="chips wrap">${m.flav.map(f => `<button class="chip" data-act="sheet-flav:${esc(f)}" aria-pressed="${f===sh.flav}">${esc(f)}</button>`).join('')}</div>` : ''}
    <label class="field" for="sheet-note">Note for the kitchen (optional)<input id="sheet-note" maxlength="60" autocomplete="off" placeholder="For example: less spicy, no mayo" value="${esc(sh.note)}"></label>
    <div class="chips wrap">${QUICK.map(q => `<button class="chip" data-act="sheet-chip:${q}">${q}</button>`).join('')}</div>
    <div class="sheet-foot"><span class="stepper"><button data-act="sheet-qty:-1" aria-label="One fewer">−</button><b class="num">${sh.qty}</b><button data-act="sheet-qty:1" aria-label="One more">+</button></span>
      <button class="btn num" data-act="sheet-add">${sh.edit!=null ? 'Save' : 'Add to order'} · ${rs(price*sh.qty)}</button></div></div></div>`;
}
function checkout(){
  const groups = cartGroups();
  if (!groups.length) return {bar:'Your order', body:`<div class="empty">Your order is empty.</div><button class="btn ghost" data-act="home">Browse outlets</button>`};
  const open = isOpen(), total = cartTotal(), why = cashRule(total), payId = S.view.pay==='cash' && why ? 'easypaisa' : S.view.pay, pay = PAY[payId];
  let h = '', ok = true;
  if (groups.length>1) h += `<div class="infobox">Your order has items from ${groups.length} outlets. You pay once and get a pickup token for each outlet.</div>`;
  for (const g of groups){
    const o = g.o, pz = paused(o), sel = open && !pz ? chosenSlot(o) : null;
    const own = workOf(g.lines.map(l => ({qty:l.qty, kind:ITEM[l.id].kind})));
    if (sel==null || g.lines.some(l => S.out[l.id])) ok = false;
    h += `<div class="grp"><div><p class="h2">${esc(o.name)}</p><p class="sub">Collect at ${esc(A[o.area].pickup)}</p></div><div class="card">` +
      g.lines.map(l => `<div class="line">${art(ITEM[l.id].kind,26)}<span class="row-main"><span style="font-weight:500">${esc(lineName(l))}</span>
        ${S.out[l.id] ? '<span class="soldtag">Just sold out. Remove it to continue.</span>' : `<span class="sub num">${rs(linePrice(l))} each</span>`}
        ${l.note ? `<span class="linenote">Note: ${esc(l.note)}</span>` : ''}<button class="link" style="text-align:left;padding:6px 0" data-act="note:${esc(l.key)}">${l.note ? 'Edit note' : 'Add a note'}</button></span>${stepper(l.key, lineName(l))}</div>`).join('') + `</div>`;
    if (!open) h += `<div class="empty">This outlet is closed at ${fmtT(S.t)}.</div>`;
    else if (pz) h += `<div class="empty">This outlet has paused app orders. Remove these items or try again shortly.</div>`;
    else {
      h += `<div><p style="font-weight:600">Pickup time</p><p class="sub">Each time takes up to ${cap(o)} app orders, so walk-in customers are still served.</p></div><div class="slots">` +
        slots().map(t => { const left = cap(o)-load(o.id,t), full = left<=0;
          return `<button class="slot num" data-act="slot:${o.id}:${t}" aria-pressed="${t===sel}" ${full?'disabled':''}><b>${fmtT(t)}</b><small>${full ? 'Full' : left+' left'}</small></button>`; }).join('') + `</div>`;
      if (sel!=null){ const q = quoteSlot(o, sel, own);
        h += `<p class="sub num"><b style="color:var(--ink)">${q.ahead} order${q.ahead===1?'':'s'} ahead</b> (app and counter). Estimated ready by <b style="color:var(--ink)">${fmtT(q.at)}</b>.</p>`; }
      else h += `<div class="empty">Every pickup time is full right now. New times open as the clock moves on.</div>`;
    }
    h += `</div>`;
  }
  h += `<p class="h2">Payment</p><div class="card" role="radiogroup" aria-label="Payment method">` +
    PAYS.map(p => { const dis = p.id==='cash' && why;
      return `<button class="pay" role="radio" aria-checked="${p.id===payId}" data-act="pay:${p.id}" ${dis?'disabled':''}><span class="radio"></span><span>${p.name}${p.id==='cash' ? `<small>${dis ? why : 'For orders up to '+rs(CASH_LIMIT)+'. A missed pickup switches this off.'}</small>` : ''}</span></button>`; }).join('') + `</div>`;
  h += `<div class="total"><span>Total</span><b class="num">${rs(total)}</b></div>`;
  h += `<button class="btn num" data-act="place" ${ok?'':'disabled'}>${pay.paid ? 'Pay '+rs(total)+' and place order' : 'Place order · pay '+rs(total)+' at pickup'}</button>`;
  h += `<p class="note">Payment is simulated. No money moves in this prototype.</p>`;
  return {bar:'Your order', body:h};
}
const STATUS_TXT = {received:'Order received', preparing:'Being prepared', ready:'Ready for pickup', collected:'Collected', cancelled:'Cancelled', rejected:'Rejected by the outlet', noshow:'Not collected'};
function tracking(ord){
  const o = O[ord.outlet], e = eta(ord), print = S.just===ord.id, refund = PAY[ord.pay].paid; S.just = null;
  let h = `<div class="ticket${print?' print':''}"><div class="t-top"><div><p class="t-lab">Pickup token</p><p class="t-code">${ord.token}</p></div><p style="font-weight:600;text-align:right">${esc(o.name)}</p></div>
    <div class="t-bot"><div><span class="t-lab">Pickup time</span><b class="num">${fmtT(ord.slot)}</b></div><div><span class="t-lab">Collect at</span><b>${esc(A[o.area].pickup)}</b></div><div><span class="t-lab">Pickup PIN</span><b class="pinv">${ord.pin}</b></div></div></div>`;
  if (ord.issue && isActive(ord)){ const rest = ord.items.some(i => i.iid!==ord.issue.iid);
    h += `<div class="infobox bad" role="alert"><b>${esc(ord.issue.name)} has just sold out.</b> Your order is on hold until you choose.</div><div class="${rest?'btnrow':''}">${rest ? `<button class="btn yellow small num" data-act="issue-remove:${ord.id}">Remove it${refund ? ', refund '+rs(ord.issue.amount) : ''}</button>` : ''}<button class="btn ghost small" data-act="cancel:${ord.id}">Cancel the order</button></div>`; }
  if (ord.status==='received' || ord.status==='preparing'){
    const span = Math.max(1, e.at-ord.placed), pct = Math.max(4, Math.min(96, (S.clock-ord.placed)/span*100));
    h += `<div class="card"><div class="ahead"><span class="big num">${e.ahead}</span><span><b>order${e.ahead===1?'':'s'} ahead of yours</b><br><span class="sub num">Ready by about ${fmtT(e.at)} · <span id="cd" data-at="${e.at}"></span></span></span></div><div class="prog"><i id="cdbar" data-from="${ord.placed}" data-at="${e.at}" style="width:${pct.toFixed(1)}%"></i></div></div>`;
    h += `<div class="btnrow"><button class="btn ghost small" data-act="late:${ord.id}" ${ord.late?'disabled':''}>${ord.late ? 'Outlet told you are late' : 'I am running late'}</button><button class="btn ghost small" data-act="cancel:${ord.id}" ${ord.status==='received'?'':'disabled'}>Cancel order</button></div>`;
    if (ord.status==='preparing') h += `<p class="note" style="margin-top:-8px">The kitchen has started on this order, so it can no longer be cancelled.</p>`;
  } else if (ord.status==='ready'){
    h += `<div class="card ahead"><span class="big" style="color:var(--ok)">✓</span><span><b>Ready for pickup</b><br><span class="sub num">Give PIN ${ord.pin} at the ${esc(A[o.area].pickup)}. Held until ${fmtT(ord.readyAt+HOLD+(ord.late?10:0))}.</span></span></div>
      <div class="btnrow"><button class="btn small" data-act="collect:${ord.id}">I have collected it</button><button class="btn ghost small" data-act="late:${ord.id}" ${ord.late?'disabled':''}>${ord.late ? 'Held 10 minutes longer' : 'I am running late'}</button></div>`;
  } else {
    const msg = {collected:'Enjoy your meal.', cancelled:refund ? rs(ord.total)+' will be refunded to '+PAY[ord.pay].name+'.' : 'Nothing was charged.', rejected:(refund ? rs(ord.total)+' will be refunded to '+PAY[ord.pay].name+'. ' : '')+'The outlet could not make this order.', noshow:refund ? 'The order was held for '+HOLD+' minutes and then released. Paid orders that are not collected are not refunded.' : 'The order was held for '+HOLD+' minutes and then released.'}[ord.status];
    h += `<div class="card ahead"><span class="big" style="color:${ord.status==='collected'?'var(--ok)':'var(--busy)'}">${ord.status==='collected'?'✓':'!'}</span><span><b>${STATUS_TXT[ord.status]}</b><br><span class="sub num">${msg}</span></span></div>`;
  }
  const si = ['received','preparing','ready','collected'].indexOf(ord.status);
  if (si>=0) h += `<div class="card steps">` + ['Order received','Being prepared','Ready for pickup','Collected'].map((n,i) => `<div class="step ${i<si||si===3?'done':i===si?'now':''}"><span class="mk"></span><span>${n}</span></div>`).join('') + `</div>`;
  h += `<div class="card">` + ord.items.map(x => `<div class="kv"><span>${x.qty} × ${esc(x.name)}${x.note ? `<br><span class="linenote">Note: ${esc(x.note)}</span>` : ''}</span><span class="num">${rs(x.qty*x.price)}</span></div>`).join('') +
    `<div class="kv"><span>${PAY[ord.pay].paid ? 'Paid with '+PAY[ord.pay].name : 'To pay at pickup'}</span><b class="num">${rs(ord.total)}</b></div></div>`;
  h += `<button class="btn ghost" data-act="home">Order something else</button>`;
  return {bar:'Order '+ord.token, body:h};
}
function ordersList(){
  const all = myOrders();
  if (!all.length) return {bar:'Your orders', body:`<div class="empty">No orders yet. Your pickup token appears here after you order.</div><button class="btn" data-act="home">Browse outlets</button>`};
  const row = x => { const e = eta(x), o = O[x.outlet];
    return `<button class="row" data-act="track:${x.id}">${art(o.kind,36,'',o)}<span class="row-main"><span class="row-name"><span style="font-family:var(--mono);font-weight:500">${x.token}</span> · ${esc(o.name)}</span>
      <span class="sub num">${x.issue && isActive(x) ? 'Needs your attention' : x.status==='received'||x.status==='preparing' ? e.ahead+' ahead · ready about '+fmtT(e.at) : STATUS_TXT[x.status]} · ${rs(x.total)}</span></span>${chev}</button>`; };
  const act = all.filter(isActive), past = all.filter(x => !isActive(x));
  return {bar:'Your orders', body:(act.length ? `<p class="h2">Active</p><div class="list">${act.map(row).join('')}</div>` : '') + (past.length ? `<p class="h2">Earlier</p><div class="list">${past.map(row).join('')}</div>` : '')};
}
function me(){
  const u = S.user;
  return {bar:'Profile', body:`<div class="ohead">${art('burger',58)}<div><p class="h2">${esc(u.name)}</p><p class="sub">ERP ${esc(u.erp)} · IBA Main Campus</p></div></div>
    <div class="card" style="padding:4px 16px"><button class="switch" style="width:100%;justify-content:space-between" role="switch" aria-checked="${S.sound}" data-act="sound"><span>Sound and vibration when an order is ready</span><span class="tr"></span></button></div>
    <div class="card" style="padding:14px 16px"><p style="font-weight:600">Cash at pickup</p><p class="sub">${S.cashStrike ? 'Switched off for this account because a cash order was not collected.' : 'Available for one order at a time, up to '+rs(CASH_LIMIT)+'. A missed pickup switches it off.'}</p></div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:8px"><p class="h2">About this prototype</p>
    <p class="sub">Tayyar means “ready”. It is a course project prototype of a pre-order service for campus food outlets, with a student app and a vendor counter screen.</p>
    <p class="sub"><b>Real:</b> outlet names, and menus and prices for the outlets whose menu boards were photographed.</p>
    <p class="sub"><b>Simulated:</b> sign-in, other customers, queue numbers, payments, refunds and kitchen progress. Opening hours and kitchen capacity are assumptions.</p>
    <p class="sub"><b>Saved on this device only:</b> your orders survive a refresh, but a student phone and a vendor screen do not yet share data.</p></div>
    <button class="btn ghost" data-act="signout">Sign out</button>`};
}

/* ================= map ================= */
const Z = {s:1, tx:0, ty:0};
function buildMap(){
  let r = 11; const rr = () => (r = (r*16807)%2147483647)/2147483647;
  const tree = (x,y,s=1) => { const R = (3.6+rr()*1.6)*s, jx = x+(rr()-.5)*3, jy = y+(rr()-.5)*3; return `<circle cx="${jx.toFixed(1)}" cy="${jy.toFixed(1)}" r="${R.toFixed(1)}" fill="#2F8A4C"/><circle cx="${(jx-1).toFixed(1)}" cy="${(jy-1.2).toFixed(1)}" r="${(R*.55).toFixed(1)}" fill="#52AE68"/>`; };
  const b = (x,y,w,h,fill,roof) => `<rect x="${x+1.5}" y="${y+2}" width="${w}" height="${h}" rx="2" fill="#000" opacity=".16"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/>${roof ? `<rect x="${x+2.5}" y="${y+2.5}" width="${w-5}" height="${h-5}" rx="1.5" fill="${roof}"/>` : ''}`;
  let t = '';
  for (let x=26;x<=268;x+=13) t += tree(x,24);
  for (let y=37;y<=192;y+=13) t += tree(24,y);
  for (let x=37;x<=140;x+=13) t += tree(x,194);
  for (let y=30;y<=298;y+=13) t += tree(378,y);
  for (let y=216;y<=298;y+=14) t += tree(158,y);
  for (let x=288;x<=366;x+=13) t += tree(x,301);
  for (let a=0;a<360;a+=22){ const x = 98+Math.cos(a*Math.PI/180)*66, y = 82+Math.sin(a*Math.PI/180)*56; if (y>30 && x>32 && y<126) t += tree(x,y,.9); }
  [[171,60],[171,76],[171,94],[268,60],[268,104],[263,178],[268,190],[346,204],[344,172],[354,152],[150,150],[150,172],[162,122],[160,104],[344,238]].forEach(p => t += tree(p[0],p[1]));
  let cars = ''; const cc = ['#E5E7EB','#FBBF24','#DC2626','#60A5FA','#F3F4F6','#9CA3AF'];
  for (let i=0;i<10;i++){ cars += `<rect x="${281+i*9}" y="28" width="5.5" height="10" rx="1.5" fill="${cc[Math.floor(rr()*6)]}"/>`; if (rr()>.25) cars += `<rect x="${281+i*9}" y="96" width="5.5" height="10" rx="1.5" fill="${cc[Math.floor(rr()*6)]}"/>`; }
  for (let i=0;i<4;i++) cars += `<rect x="${304+i*11}" y="54" width="8" height="20" rx="2" fill="#DC2626"/><rect x="${305.5+i*11}" y="56" width="5" height="4" rx="1" fill="#FCA5A5"/>`;
  let umb = ''; [[220,268],[232,268],[220,279],[232,279],[220,290],[232,290],[226,300]].forEach((p,i) => umb += `<circle cx="${p[0]}" cy="${p[1]}" r="4.2" fill="${i%2 ? '#FBBF24' : '#DC2626'}"/><circle cx="${p[0]}" cy="${p[1]}" r="1.2" fill="#fff"/>`);
  const pin = a => { const w = a.name.length*4.9+12, lx = a.la==='r' ? a.x+13 : a.la==='l' ? a.x-13-w : a.x-w/2, ly = a.la==='b' ? a.y+3 : a.y-23;
    return `<g class="pin" id="pin-${a.id}" data-act="maparea:${a.id}" role="button" tabindex="0"><circle class="halo" cx="${a.x}" cy="${a.y-15.5}" r="10"/>
      <path class="pb" d="M${a.x} ${a.y}c-3-6-10-8.5-10-15.5a10 10 0 1 1 20 0c0 7-7 9.5-10 15.5z"/><text class="pc" x="${a.x}" y="${a.y-12}" text-anchor="middle">0</text>
      <rect class="plb" x="${lx}" y="${ly}" width="${w}" height="14.5" rx="7.2"/><text class="plt" x="${lx+w/2}" y="${ly+10.3}" text-anchor="middle">${esc(a.name)}</text></g>`; };
  return `<g id="mapzoom">
    <path d="M8 8H393V316H142V210H8Z" fill="#3B4350"/>
    <path d="M12.5 12.5H388.5V311.5H146.5V205.5H12.5Z" fill="none" stroke="#fff" stroke-width=".8" stroke-dasharray="4 4" opacity=".45"/>
    <path d="M17 17H384V307H151V201H17Z" fill="#E9DCC3"/>
    <rect x="164" y="307" width="31" height="9" fill="#F5F5F4"/><rect x="246" y="307" width="31" height="9" fill="#F5F5F4"/>
    <circle cx="151" cy="201" r="10" fill="#3B4350"/><circle cx="151" cy="201" r="5" fill="#52AE68"/>
    <ellipse cx="98" cy="82" rx="60" ry="50" fill="#5DB56A"/><ellipse cx="98" cy="82" rx="46" ry="38" fill="none" stroke="#7CC987" stroke-width="5"/><ellipse cx="98" cy="82" rx="28" ry="23" fill="none" stroke="#7CC987" stroke-width="4"/>
    <rect x="80" y="76" width="36" height="12" rx="1.5" fill="#E3B778"/>
    <rect x="26" y="134" width="46" height="56" rx="3" fill="#6FC07A"/>
    <rect x="182" y="59" width="81" height="46" rx="2" fill="#4FAF5F"/><g fill="none" stroke="#fff" stroke-width=".9" opacity=".9"><rect x="185" y="62" width="75" height="40"/><path d="M222.5 62v40"/><circle cx="222.5" cy="82" r="6"/><rect x="185" y="73" width="8" height="18"/><rect x="252" y="73" width="8" height="18"/></g>
    <rect x="182" y="28" width="18" height="24" rx="1.5" fill="#3B82F6"/><rect x="204" y="28" width="18" height="24" rx="1.5" fill="#3B82F6"/><rect x="228" y="30" width="32" height="20" rx="1.5" fill="#DC6B5A"/>
    <rect x="274" y="23" width="101" height="88" rx="3" fill="#59626F"/><g stroke="#fff" stroke-width=".6" opacity=".5">${Array.from({length:11},(_,i) => `<path d="M${279.5+i*9} 26v14M${279.5+i*9} 94v14"/>`).join('')}</g>${cars}
    <rect x="276" y="243" width="64" height="50" rx="3" fill="#6FC07A"/><rect x="286" y="261" width="44" height="14" rx="2" fill="#3F5E77"/>
    ${b(274,114,64,22,'#AEB6C2','#C9CFD8')}${b(308,134,30,30,'#AEB6C2','#C9CFD8')}
    ${b(186,111,42,30,'#8F98A6','#A9B1BD')}${b(206,128,51,38,'#8F98A6','#A9B1BD')}
    ${b(78,138,64,57,'#B8BEC8','#D5D9E0')}<path d="M88 144l20 22-20 22M132 144l-20 22 20 22" fill="none" stroke="#9CA3AF" stroke-width="1"/>
    ${b(182,172,61,25,'#4E6C8C','#5F7FA1')}
    ${b(276,170,26,27,'#F5F5F4')}<circle cx="289" cy="176" r="6" fill="#fff" stroke="#D6D3D1" stroke-width=".8"/><rect x="298" y="158" width="4" height="14" rx="1.5" fill="#fff" stroke="#D6D3D1" stroke-width=".6"/>
    ${b(165,208,43,82,'#8F98A6','#A9B1BD')}<path d="M186.5 212v74" stroke="#7B8493" stroke-width="1"/>
    ${b(244,210,41,22,'#C9CFD8','#E5E7EB')}${b(298,212,42,22,'#C9CFD8','#E5E7EB')}${b(348,237,27,55,'#4E6C8C','#5F7FA1')}
    <rect x="214" y="213" width="24" height="7" rx="1.5" fill="#DC2626"/><path d="M218 213v7M222 213v7M226 213v7M230 213v7M234 213v7" stroke="#fff" stroke-width="1.6"/><rect x="214" y="222" width="24" height="7" rx="1.5" fill="#FBBF24"/>
    ${b(244,262,25,24,'#2563EB','#3B82F6')}
    <rect x="213" y="262" width="26" height="44" rx="3" fill="#F3E3C0" stroke="#D9C39A" stroke-width=".8"/>${umb}
    <rect x="100" y="185" width="20" height="5" rx="1.5" fill="#DC2626"/><rect x="318" y="216" width="20" height="5" rx="1.5" fill="#DC2626"/>
    ${t}
    <g class="mlbl" text-anchor="middle"><text x="98" y="62">Cricket ground</text><text x="222.5" y="99" style="fill:#fff;stroke:rgba(0,0,0,.3)">Football ground</text><text x="324" y="84">Parking</text>
      <text x="306" y="128">Aman CED</text><text x="231" y="150">Tabba Block</text><text x="110" y="148">Student Center</text><text x="212" y="187" style="fill:#fff;stroke:rgba(0,0,0,.35)">OBS Courtyard</text>
      <text x="264.5" y="229">Auditorium</text><text x="308" y="287">Central lawn</text><text transform="translate(189 250) rotate(-90)">Adamjee</text><text transform="translate(364.5 265) rotate(-90)" style="fill:#fff;stroke:rgba(0,0,0,.35)">Fauji</text>
      <text x="179.5" y="313.5" style="font-size:5.4px;stroke:none">ENTRANCE</text><text x="261.5" y="313.5" style="font-size:5.4px;stroke:none">EXIT</text></g>
    <rect id="tint" x="0" y="0" width="400" height="330" fill="#1E1B4B" opacity="0" pointer-events="none"/>
    ${[...AREAS].sort((p,q) => p.y-q.y).map(pin).join('')}
  </g>`;
}
function setZoom(s,tx,ty,anim){
  s = Math.max(1, Math.min(3.2, s));
  Z.s = s; Z.tx = Math.min(0, Math.max(400-400*s, tx)); Z.ty = Math.min(0, Math.max(330-330*s, ty));
  const g = $('#mapzoom'); g.style.transition = anim ? 'transform .45s cubic-bezier(.2,.8,.2,1)' : 'none';
  g.style.transform = `translate(${Z.tx}px,${Z.ty}px) scale(${Z.s})`;
  $('#mapsvg').style.touchAction = s>1 ? 'none' : 'pan-y';
}
const zoomTo = a => setZoom(2.1, 200-a.x*2.1, 150-(a.y-12)*2.1, true);
function zoomBy(d){ const cx = (200-Z.tx)/Z.s, cy = (165-Z.ty)/Z.s, s = Math.max(1, Math.min(3.2, Z.s+d)); setZoom(s, 200-cx*s, 165-cy*s, true); }
function hands(){ const c = S.clock; $('#hh').setAttribute('transform', `rotate(${(c%720)/2} 20 20)`); $('#mh').setAttribute('transform', `rotate(${(c%60)*6} 20 20)`); }
function countdown(){
  const el = document.getElementById('cd'); if (!el) return;
  const rem = +el.dataset.at - S.clock;
  el.textContent = rem<=0 ? 'any moment now' : rem<1 ? 'under a minute left' : Math.floor(rem)+' min '+String(Math.floor((rem%1)*60)).padStart(2,'0')+' s left';
  const bar = document.getElementById('cdbar'); if (bar){ const from = +bar.dataset.from, at = +bar.dataset.at; bar.style.width = Math.max(4, Math.min(96, (S.clock-from)/Math.max(1,at-from)*100)).toFixed(1)+'%'; }
}
function updateMap(){
  for (const a of AREAS){ const st = areaStats(a), l = level(st.best), el = document.getElementById('pin-'+a.id);
    el.setAttribute('class', 'pin '+l.k+(S.view.mapArea===a.id ? ' sel' : ''));
    el.querySelector('.pc').textContent = st.best.closed ? '–' : st.queue;
    el.setAttribute('aria-label', `${a.name}: ${st.best.closed ? 'closed' : st.queue+' orders in the queue, '+l.t.toLowerCase()}`); }
  const t = S.clock, dusk = t>1050 ? Math.min(.34,(t-1050)/150*.34) : t<420 ? .34 : 0, dawn = t>=420 && t<560 ? (560-t)/140*.14 : 0;
  const tint = $('#tint'); tint.setAttribute('fill', dusk ? '#1E1B4B' : '#F59E0B'); tint.setAttribute('opacity', (dusk||dawn).toFixed(3));
  hands();
  const x = Math.max(0, Math.min(300, (S.t-OPEN)/(CLOSE-OPEN)*300));
  $('#curve-now').setAttribute('x1', x); $('#curve-now').setAttribute('x2', x);
}
function buildCurve(){
  let d = ''; for (let t=OPEN;t<=CLOSE;t+=10) d += ` L${((t-OPEN)/(CLOSE-OPEN)*300).toFixed(1)} ${(42-demand(Math.min(t,CLOSE-1))/1.2*36).toFixed(1)}`;
  return `<path d="M0 44${d} L300 44Z" fill="#FDE68A"/><path d="M${d.slice(2)}" fill="none" stroke="#F59E0B" stroke-width="1.5" vector-effect="non-scaling-stroke"/><line id="curve-now" x1="0" x2="0" y1="0" y2="44" stroke="#DC2626" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}

/* ================= vendor screen ================= */
const EN = {title:'Vendor counter', tomake:'To make', ready:'Ready for pickup', making:'Making now', markReady:'Ready', handOver:'Hand over', reject:'Reject this order', addCounter:'Add a counter order', app:'App', counter:'Counter', late:'Running late', paid:'Paid', cash:'Collect cash', paidCounter:'Paid at the counter', askpin:'Ask for PIN', nothing:'Nothing here', pause:'Pause app orders', cap:'App orders per 10 minutes', auto:'Kitchen runs by itself (demo)', sound:'Sound', avail:'Menu availability', availHint:'Switch an item off when it runs out', sTomake:'To make', sReady:'Ready', sNext:'App orders booked for', times:'Pickup times for app orders', booked:'booked', full:'full', closed:'Closed', pausedMsg:'App orders are paused. Students cannot place new orders until you switch this off.', pinTitle:'Enter the outlet PIN', unlock:'Unlock', pinHint:'Demo PIN: 1234', wrongPin:'That PIN is not right. The demo PIN is 1234.', onHold:'On hold: item sold out, waiting for the student'};
const UR = {title:'وینڈر کاؤنٹر', tomake:'بنانے والے آرڈر', ready:'تیار آرڈر', making:'ابھی بن رہا ہے', markReady:'تیار ہے', handOver:'حوالے کریں', reject:'یہ آرڈر منسوخ کریں', addCounter:'کاؤنٹر آرڈر شامل کریں', app:'ایپ', counter:'کاؤنٹر', late:'طالب علم دیر سے آئے گا', paid:'ادائیگی ہو چکی', cash:'نقد وصول کریں', paidCounter:'کاؤنٹر پر ادائیگی', askpin:'پن پوچھیں', nothing:'کوئی آرڈر نہیں', pause:'ایپ آرڈر روک دیں', cap:'ہر 10 منٹ میں ایپ آرڈر', auto:'کچن خود چلائیں (ڈیمو)', sound:'آواز', avail:'مینو کی دستیابی', availHint:'جو چیز ختم ہو جائے اسے بند کر دیں', sTomake:'بنانے ہیں', sReady:'تیار', sNext:'بک شدہ ایپ آرڈر', times:'ایپ آرڈر کے پک اپ اوقات', booked:'بک', full:'بھر گیا', closed:'بند', pausedMsg:'ایپ آرڈر بند ہیں۔ طلبہ ابھی نیا آرڈر نہیں دے سکتے۔', pinTitle:'دکان کا پن درج کریں', unlock:'کھولیں', pinHint:'ڈیمو پن: 1234', wrongPin:'پن غلط ہے۔ ڈیمو پن 1234 ہے۔', onHold:'رکا ہوا: چیز ختم ہے، طالب علم کے جواب کا انتظار'};
const tx = k => S.vlang==='ur' ? `<span class="ur">${UR[k]}</span>` : EN[k];
function vcard(x, col){
  const tags = (x.status==='preparing' ? `<span class="tag making">${tx('making')}</span>` : '') + `<span class="tag ${x.src}">${tx(x.src)}</span>` + (x.src==='app' ? `<span class="tag when num">${fmtT(x.slot)}</span>` : '') + (x.late ? `<span class="tag late">${tx('late')}</span>` : '');
  const payTxt = x.src==='counter' ? tx('paidCounter') : PAY[x.pay].paid ? tx('paid')+' · '+PAY[x.pay].name : tx('cash')+' <bdi>'+rs(x.total)+'</bdi>';
  const btns = col==='ready' ? `<div class="ord-btns"><button class="btn" data-act="v-next:${x.id}">${tx('handOver')}</button></div>`
    : `<div class="ord-btns"><button class="btn yellow" data-act="v-next:${x.id}" ${x.issue?'disabled':''}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${tx('markReady')}</button>${x.src==='app' ? `<button class="rej" data-act="v-reject:${x.id}" aria-label="${EN.reject}" title="${EN.reject}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>` : ''}</div>`;
  return `<div class="ord${x.mine?' mine':''}${x.status==='preparing'?' now':''}"><div class="ord-top"><span class="tk">${x.token}</span><span style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end">${tags}</span></div>
    <div class="what">${x.items.map(i => `${i.qty} × ${esc(i.name)}${i.note ? `<span class="onote">${esc(i.note)}</span>` : ''}`).join('<br>')}</div>
    ${x.issue ? `<div class="onote">${tx('onHold')}</div>` : ''}
    <div class="meta">${x.mine && S.user ? esc(S.user.name)+' · ' : ''}${payTxt}</div>
    ${col==='ready' && x.src==='app' ? `<div class="pinask">${tx('askpin')} <bdi><b>${x.pin}</b></bdi></div>` : ''}${btns}</div>`;
}
function vendorBody(){
  if (!S.vauth) return `<div class="vgate"><p class="h2" style="font-size:19px">${tx('pinTitle')}</p><p class="sub">${esc(O[S.vendorOutlet].name)}</p>
    <label class="field" for="vpin" style="text-align:left">PIN<input id="vpin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></label>
    ${S.view.verr ? `<p class="err" role="alert">${tx('wrongPin')}</p>` : ''}<button class="btn" data-act="vunlock">${tx('unlock')}</button><p class="note">${tx('pinHint')}</p></div>`;
  const o = O[S.vendorOutlet], open = isOpen(), pz = paused(o);
  const mk = pend(o.id), rd = S.orders.filter(x => x.outlet===o.id && x.status==='ready').sort((a,b) => a.readyAt-b.readyAt || a.id-b.id), sl = slots();
  let h = `<div class="vctl"><button class="switch warn" role="switch" aria-checked="${pz}" data-act="v-pause"><span class="tr"></span>${tx('pause')}</button>
    <span class="capctl">${tx('cap')}<span class="stepper"><button data-act="v-cap:-1" aria-label="Fewer app orders per 10 minutes">−</button><b class="num">${cap(o)}</b><button data-act="v-cap:1" aria-label="More app orders per 10 minutes">+</button></span></span>
    <button class="switch" role="switch" aria-checked="${S.vsound}" data-act="v-sound"><span class="tr"></span>${tx('sound')}</button>
    <button class="switch" role="switch" aria-checked="${S.auto}" data-act="v-auto"><span class="tr"></span>${tx('auto')}</button></div>`;
  if (pz) h += `<div class="infobox bad">${tx('pausedMsg')}</div>`;
  h += `<div class="vtop"><div class="stat"><b class="num">${mk.length}</b><span>${tx('sTomake')}</span></div><div class="stat"><b class="num">${rd.length}</b><span>${tx('sReady')}</span></div>
    <div class="stat"><b class="num">${open ? load(o.id,sl[0])+' / '+cap(o) : '–'}</b><span>${open ? tx('sNext')+' <bdi class="num">'+fmtT(sl[0])+'</bdi>' : tx('closed')}</span></div>
    <button class="counterbtn" data-act="v-counter"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>${tx('addCounter')}</button></div>`;
  if (open) h += `<div><p class="h2" style="margin-bottom:8px">${tx('times')}</p><div class="vslots">` + sl.map(t => { const ld = load(o.id,t), full = ld>=cap(o);
    return `<div class="vslot${full?' full':''}"><b class="num">${fmtT(t)}</b><small class="num"><bdi>${ld} / ${cap(o)}</bdi> ${tx('booked')}${full ? ' · '+tx('full') : ''}</small><div class="meter"><i style="width:${Math.min(100,ld/cap(o)*100)}%"></i></div></div>`; }).join('') + `</div></div>`;
  h += `<div class="board"><div class="col"><div class="col-h"><span>${tx('tomake')}</span><span class="cnt num">${mk.length}</span></div>${mk.length ? `<div class="cards">${mk.map(x => vcard(x,'make')).join('')}</div>` : `<div class="col-empty">${tx('nothing')}</div>`}</div>
    <div class="col"><div class="col-h"><span>${tx('ready')}</span><span class="cnt num">${rd.length}</span></div>${rd.length ? rd.map(x => vcard(x,'ready')).join('') : `<div class="col-empty">${tx('nothing')}</div>`}</div></div>`;
  h += `<div><div class="sec-h"><p class="h2">${tx('avail')}</p><span class="sub">${tx('availHint')}</span></div>` +
    o.menu.map(s => `<p class="avsec">${esc(s.t)}</p><div class="avail">${s.items.map(m => `<button class="switch" role="switch" aria-checked="${!S.out[m.id]}" data-act="v-item:${m.id}"><span>${esc(m.name)}</span><span class="tr"></span></button>`).join('')}</div>`).join('') + `</div>`;
  return h;
}

/* ================= render ================= */
function put(el, html){ if (el._h !== html){ el._h = html; el.innerHTML = html; } }
const TABIC = {
  home:'<path d="M12 3.2 3 10.5V20a1 1 0 0 0 1 1h5.5v-6h5v6H20a1 1 0 0 0 1-1v-9.5z"/>',
  map:'<path d="M12 22s-7-6.2-7-12a7 7 0 1 1 14 0c0 5.800-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>',
  orders:'<path d="M4 6h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4V7a1 1 0 0 1 1-1zm10 2.5v7h1.5v-7z"/>',
  me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z"/>'
};
function tabsHtml(){
  if (!S.user) return '';
  const n = myActive().length, t = S.view.tab;
  const b = (id,label,extra='') => `<button class="tab" data-act="tab:${id}" ${t===id?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${TABIC[id]}</svg>${label}${extra}</button>`;
  return b('home','Home') + b('map','Map') + b('orders','Orders', n ? `<span class="badge num">${n}</span>` : '') + b('me','Profile');
}
function current(){
  if (!S.user) return {...loginScreen(), kind:'other'};
  const v = S.view, top = v.stack[v.stack.length-1];
  if (v.tab==='orders'){ const ord = S.orders.find(x => x.id===v.orderId && x.mine); return ord ? {...tracking(ord), back:true, kind:'other'} : {...ordersList(), kind:'other'}; }
  if (v.tab==='me') return {...me(), kind:'other'};
  if (top) return {...(top.s==='menu' ? menuScreen(top.id) : checkout()), back:true, s:top.s, kind:'other'};
  if (v.tab==='map') return {kind:'map', bar:'Campus map', body:mapBody()};
  return {kind:'home', body:homeBody()};
}
function effLayout(){ return matchMedia('(max-width:899px)').matches && S.layout==='both' ? 'student' : S.layout; }
function render(nav){
  QC = {};
  const scr = $('#screen'), keepTop = scr.scrollTop, ae = document.activeElement, fa = ae && ae.dataset ? ae.dataset.act : null;
  const c = current();
  $('#hero').hidden = c.kind!=='home'; $('#mapview').hidden = c.kind!=='map';
  put($('#bar'), c.kind==='home' ? '' : `<div class="bar-l">${c.back ? '<button class="back" data-act="back" aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' : ''}<span class="bar-t">${esc(c.bar)}</span></div>
    <span class="clockchip"><span class="livedot"></span><b class="js-time"></b></span>`);
  $('#body').className = 'body' + (c.kind==='home' ? ' sheet-top' : '');
  put($('#body'), c.body);
  scr.scrollTop = nav ? 0 : keepTop;
  const n = cartCount(), showBar = S.user && (S.view.tab==='home' || S.view.tab==='map') && n>0 && c.s!=='checkout';
  put($('#cartbar'), showBar ? `<button class="btn" data-act="checkout"><span class="num">${n} item${n>1?'s':''} · ${rs(cartTotal())}</span><span>Review order</span></button>` : '');
  put($('#tabs'), tabsHtml());
  put($('#sheet'), sheetHtml());
  const ts = S.toast;
  put($('#toast'), ts ? `<div class="toast ${ts.kind}" role="alert"><p>${esc(ts.msg)}</p><button data-act="toast-x" aria-label="Dismiss">×</button></div>` : '');
  $('#sortbtn').setAttribute('aria-pressed', S.view.sort);
  updateMap();
  // vendor
  const vb = $('#v-body'), vTop = vb.scrollTop, ur = S.vlang==='ur';
  $('#v-name').textContent = O[S.vendorOutlet].name;
  const ey = $('#v-eyebrow'); ey.textContent = ur ? UR.title : EN.title; ey.className = ur ? 'ur' : '';
  if ($('#v-outlet').value !== S.vendorOutlet) $('#v-outlet').value = S.vendorOutlet;
  $('#vl-en').setAttribute('aria-pressed', !ur); $('#vl-ur').setAttribute('aria-pressed', ur);
  $('#v-lock').hidden = !S.vauth;
  put(vb, vendorBody()); vb.scrollTop = vTop;
  // chrome
  const lay = effLayout(); $('#stage').dataset.layout = lay;
  for (const k of ['student','vendor','both']) $('#seg-'+k).setAttribute('aria-pressed', lay===k);
  $('#demo').hidden = !S.demoOpen; $('#demobtn').setAttribute('aria-expanded', S.demoOpen);
  $('#d-live').setAttribute('aria-pressed', S.live); $('#d-ff').setAttribute('aria-pressed', S.ff);
  if (document.activeElement !== $('#tc-range')) $('#tc-range').value = Math.max(OPEN, Math.min(1195, S.t));
  const tm = fmtT(S.t), md = modeLabel();
  document.querySelectorAll('.js-time').forEach(e => e.textContent = tm);
  document.querySelectorAll('.js-mode').forEach(e => e.textContent = md);
  countdown();
  if (fa && (!document.activeElement || document.activeElement===document.body)){ const f = document.querySelector('[data-act="'+fa.replace(/["\\]/g,'\\$&')+'"]'); if (f) f.focus({preventScroll:true}); }
  save();
}

/* ================= actions ================= */
const findOrd = v => S.orders.find(x => x.id===+v);
function recalc(x){ x.total = x.items.reduce((s,i) => s+i.qty*i.price, 0); x.work = workOf(x.items); }
function placeOrders(){
  const V = S.view, groups = cartGroups(), total = cartTotal();
  if (!S.user || !groups.length || !isOpen()) return false;
  const payId = V.pay==='cash' && cashRule(total) ? 'easypaisa' : V.pay, made = [];
  for (const g of groups){ if (paused(g.o) || chosenSlot(g.o)==null || g.lines.some(l => S.out[l.id])) return false; }
  for (const g of groups){
    const items = g.lines.map(l => ({iid:l.id, name:lineName(l), qty:l.qty, price:linePrice(l), kind:ITEM[l.id].kind, note:l.note||''}));
    made.push(mkOrder(g.o, items, chosenSlot(g.o), payId, 'app', true));
  }
  S.cart = []; V.stack = []; V.slots = {}; V.q = ''; $('#q').value = ''; V.tab = 'orders'; V.orderId = made.length===1 ? made[0].id : null; S.just = made[0].id; S.vendorOutlet = made[0].outlet;
  if (S.vsound) beep(1);
  return true;
}
function act(a){
  const i = a.indexOf(':'), k = i<0 ? a : a.slice(0,i), v = i<0 ? '' : a.slice(i+1), V = S.view;
  let nav = false;
  switch (k){
    case 'layout': S.layout = v; break;
    case 'demo': S.demoOpen = !S.demoOpen; break;
    case 'signin': { const val = ($('#erp') ? $('#erp').value : '').trim(); V.erp = val;
      if (!/^\d{5}$/.test(val)){ V.err = 'Enter your 5-digit ERP ID, for example 27145.'; break; }
      S.user = {erp:val, name:'Student '+val}; V.err = ''; V.erp = ''; nav = true; break; }
    case 'demo-user': S.user = {erp:'27145', name:'Demo Student'}; V.err = ''; nav = true; break;
    case 'signout': S.user = null; V.tab = 'home'; V.stack = []; nav = true; break;
    case 'tab': { const same = V.tab===v; V.tab = v; V.stack = [];
      if (v==='orders'){ if (same) V.orderId = null; else if (!V.orderId){ const m = myActive(); if (m.length===1) V.orderId = m[0].id; } }
      nav = true; break; }
    case 'home': V.tab = 'home'; V.stack = []; nav = true; break;
    case 'back': if (V.tab==='orders') V.orderId = null; else V.stack.pop(); nav = true; break;
    case 'cat': V.cat = v; break;
    case 'sort': V.sort = !V.sort; break;
    case 'clear': V.cat = 'All'; V.sort = false; V.q = ''; $('#q').value = ''; break;
    case 'seeon': V.tab = 'map'; V.stack = []; V.mapArea = v; zoomTo(A[v]); nav = true; break;
    case 'maparea': V.mapArea = v; zoomTo(A[v]); break;
    case 'mapreset': V.mapArea = null; setZoom(1,0,0,true); break;
    case 'zoom': zoomBy(v==='in' ? .7 : -.7); break;
    case 'live': S.ff = false; S.notice = false; jumpTo(realNow(), true, true); break;
    case 'ff': S.ff = !S.ff; if (S.ff) S.live = false; break;
    case 'outlet': V.stack.push({s:'menu', id:v}); nav = true; break;
    case 'sec': { const el = document.getElementById('sec-'+v); if (el) el.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); return; }
    case 'add': { const m = ITEM[v]; if (S.out[v]) break;
      if (m.opts || m.flav) V.sheet = {id:v, opt:0, flav:m.flav ? m.flav[0] : null, note:'', qty:1, edit:null};
      else addLine({id:v, opt:null, flav:null, note:'', qty:1}); break; }
    case 'inc': { const l = S.cart.find(x => x.key===v); if (l) l.qty++; break; }
    case 'dec': { const l = S.cart.find(x => x.key===v); if (l && --l.qty<=0) S.cart = S.cart.filter(x => x!==l); break; }
    case 'note': { const l = S.cart.find(x => x.key===v); if (l) V.sheet = {id:l.id, opt:l.opt==null ? 0 : l.opt, flav:l.flav, note:l.note||'', qty:l.qty, edit:l.key}; break; }
    case 'sheet-opt': V.sheet.opt = +v; break;
    case 'sheet-flav': V.sheet.flav = v; break;
    case 'sheet-qty': V.sheet.qty = Math.max(1, Math.min(20, V.sheet.qty + (+v))); break;
    case 'sheet-chip': { const cur = V.sheet.note.trim(); if (!cur.toLowerCase().includes(v.toLowerCase())) V.sheet.note = (cur ? cur+', ' : '') + (cur ? v.toLowerCase() : v); break; }
    case 'sheet-close': V.sheet = null; break;
    case 'sheet-add': { const sh = V.sheet, m = ITEM[sh.id];
      if (sh.edit!=null) S.cart = S.cart.filter(x => x.key!==sh.edit);
      addLine({id:sh.id, opt:m.opts ? sh.opt : null, flav:m.flav ? sh.flav : null, note:sh.note.trim().slice(0,60), qty:sh.qty}); V.sheet = null; break; }
    case 'checkout': V.stack.push({s:'checkout'}); nav = true; break;
    case 'slot': { const j = v.lastIndexOf(':'); V.slots[v.slice(0,j)] = +v.slice(j+1); break; }
    case 'pay': V.pay = v; break;
    case 'place': nav = placeOrders(); break;
    case 'track': V.tab = 'orders'; V.stack = []; V.orderId = +v; if (S.layout==='vendor') S.layout = 'student'; nav = true; break;
    case 'collect': { const x = findOrd(v); if (x && x.status==='ready') x.status = 'collected'; break; }
    case 'cancel': { const x = findOrd(v); if (!x || !(x.status==='received' || (x.issue && x.status==='preparing'))) break;
      x.status = 'cancelled'; x.issue = null; notify(`Order ${x.token} is cancelled.` + (PAY[x.pay].paid ? ` ${rs(x.total)} will be refunded.` : ''), '', true); break; }
    case 'late': { const x = findOrd(v); if (!x || x.late || !isActive(x)) break; x.late = true;
      if (x.status==='received'){ const o = O[x.outlet], ns = slots().find(t => t>x.slot && load(o.id,t) < cap(o));
        if (ns!=null){ x.slot = ns; notify(`Pickup moved to ${fmtT(ns)}. The kitchen will start later.`, '', true); } else notify('No later pickup time is free, but the outlet knows you are running late.', '', true); }
      else notify('The outlet has been told. Your order will be held 10 minutes longer.', '', true);
      break; }
    case 'issue-remove': { const x = findOrd(v); if (!x || !x.issue) break; const amt = x.issue.amount;
      x.items = x.items.filter(it => it.iid!==x.issue.iid); x.issue = null;
      if (!x.items.length) x.status = 'cancelled'; else recalc(x);
      notify(PAY[x.pay].paid ? `Item removed. ${rs(amt)} will be refunded.` : 'Item removed from your order.', '', true); break; }
    case 'toast-x': S.toast = null; break;
    case 'sound': S.sound = !S.sound; break;
    case 'reset': { const lay = S.layout, demoOpen = S.demoOpen; S = fresh(); S.layout = lay; S.demoOpen = demoOpen; $('#q').value = ''; initClock(); seed(); setZoom(1,0,0,false); nav = true; break; }
    /* vendor */
    case 'vlang': S.vlang = v; break;
    case 'vunlock': { const val = $('#vpin') ? $('#vpin').value : ''; if (val==='1234'){ S.vauth = true; V.verr = false; } else V.verr = true; break; }
    case 'vlock': S.vauth = false; V.verr = false; break;
    case 'v-auto': S.auto = !S.auto; break;
    case 'v-sound': S.vsound = !S.vsound; break;
    case 'v-pause': { const id = S.vendorOutlet; S.vo[id] = {...(S.vo[id]||{}), paused:!paused(O[id])}; break; }
    case 'v-cap': { const o = O[S.vendorOutlet]; S.vo[o.id] = {...(S.vo[o.id]||{}), cap:Math.max(1, Math.min(o.rate, cap(o)+(+v)))}; break; }
    case 'v-counter': { const o = O[S.vendorOutlet]; mkOrder(o, [{iid:null, name:'Counter order', qty:1, price:0, kind:'roll', note:''}], S.t, 'cash', 'counter', false); break; }
    case 'v-next': { const x = findOrd(v); if (!x) break; if (x.status==='ready') x.status = 'collected'; else if (isActive(x) && !x.issue) setReady(x); break; }
    case 'v-reject': { const x = findOrd(v); if (!x || !isActive(x)) break; x.status = 'rejected'; x.issue = null;
      if (x.mine) notify(`${O[x.outlet].name} could not make order ${x.token}.` + (PAY[x.pay].paid ? ` ${rs(x.total)} will be refunded.` : ''), 'bad'); break; }
    case 'v-item': { const m = ITEM[v];
      if (S.out[v]){ delete S.out[v]; for (const x of S.orders) if (x.issue && x.issue.iid===v) x.issue = null; break; }
      S.out[v] = true;
      for (const x of S.orders) if (x.outlet===m.o && (x.status==='received'||x.status==='preparing') && x.items.some(it => it.iid===v)){
        if (x.mine){ x.issue = {iid:v, name:m.name, amount:x.items.filter(it => it.iid===v).reduce((s,it) => s+it.qty*it.price, 0)};
          notify(`${m.name} has just sold out at ${O[m.o].name}. Open order ${x.token} to choose what to do.`, 'bad'); }
        else { x.items = x.items.filter(it => it.iid!==v); if (!x.items.length) x.status = 'cancelled'; else recalc(x); }
      }
      break; }
  }
  render(nav);
}
let drag = null, dragged = false;
document.addEventListener('click', e => {
  if (!AC){ try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (err) {} }
  if (AC && AC.state==='suspended'){ try { AC.resume(); } catch (err) {} }
  const t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
  if (t.classList.contains('sheet-wrap') && e.target!==t) return;
  act(t.dataset.act);
});
document.addEventListener('keydown', e => {
  if ((e.key==='Enter' || e.key===' ') && e.target.matches && e.target.matches('g[data-act]')){ e.preventDefault(); act(e.target.dataset.act); }
  if (e.key==='Enter' && e.target.id==='erp') act('signin');
  if (e.key==='Enter' && e.target.id==='vpin') act('vunlock');
  if (e.key==='Escape' && S.view.sheet) act('sheet-close');
});
document.addEventListener('input', e => {
  if (e.target.id==='sheet-note' && S.view.sheet) S.view.sheet.note = e.target.value;
  if (e.target.id==='q'){ S.view.q = e.target.value.trim().toLowerCase(); render(); }
  if (e.target.id==='tc-range'){ S.notice = false; jumpTo(+e.target.value, false, true); render(); }
});

/* ================= boot ================= */
function initClock(){ const rn = realNow(); S.clock = rn; S.t = Math.floor(rn); if (isOpen()) S.live = true; else { S.clock = S.t = 770; S.live = false; S.notice = true; } }
function start(saved){
  const keep = saved && saved.v===3 && saved.orders && saved.view ? saved : loadSaved();
  if (keep){ S = keep; S.toast = null; S.view.sheet = null; if (S.live) jumpTo(realNow(), true, false); }
  else { S = fresh(); initClock(); seed(); }
  $('#hero-art').innerHTML = ico('burger',104);
  const svg = $('#mapsvg'); svg.innerHTML = buildMap(); $('#curve').innerHTML = buildCurve();
  svg.addEventListener('pointerdown', e => { if (Z.s<=1) return; drag = {x:e.clientX, y:e.clientY, tx:Z.tx, ty:Z.ty}; dragged = false; });
  window.addEventListener('pointermove', e => { if (!drag) return; const k = 400/svg.clientWidth, dx = (e.clientX-drag.x)*k, dy = (e.clientY-drag.y)*k; if (Math.abs(dx)+Math.abs(dy) > 4) dragged = true; if (dragged) setZoom(Z.s, drag.tx+dx, drag.ty+dy, false); });
  window.addEventListener('pointerup', () => { drag = null; setTimeout(() => dragged = false, 0); });
  svg.addEventListener('click', e => { if (dragged){ e.stopPropagation(); e.preventDefault(); } }, true);
  const sel = $('#v-outlet');
  sel.innerHTML = AREAS.map(a => `<optgroup label="${esc(a.name)}">${OUTLETS.filter(o => o.area===a.id).map(o => `<option value="${o.id}">${esc(o.name)}</option>`).join('')}</optgroup>`).join('');
  sel.addEventListener('change', () => { S.vendorOutlet = sel.value; render(); });
  matchMedia('(max-width:899px)').addEventListener('change', () => render());
  window.addEventListener('pagehide', () => save(true));
  $('#q').value = S.view.q || '';
  if (S.view.mapArea) zoomTo(A[S.view.mapArea]);
  render(true);
  setInterval(tick, 1000);
}
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(() => S);
if (hot && hot.ready) hot.ready(start); else start(hot && hot.data ? hot.data : null);
