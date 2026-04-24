// ============================================================
//  MARIANTO MATES — LÓGICA DE LA TIENDA
// ============================================================

let cart = [];
let allProducts = [];
let engrOn = false;
let upFile = null;
let curStep = 1;
let mpSel = null;
let orderNum = null;

// ── FORMATO ──────────────────────────────────────────────────
function fmt(n) { return '$' + Math.round(n).toLocaleString('es-AR'); }

// ── PRODUCTOS ────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  { id: 12, nombre: 'Pack Mate + Bombilla', categoria: 'mate', precio: 5800, icono: '🧉', descripcion: 'Combo perfecto para regalar.', badge: 'Pack', stock: 4, grabable: true, activo: true },
  { id: 8, nombre: 'Gorra Marianto Classic', categoria: 'varios', precio: 6500, icono: '🧢', descripcion: 'Bordado del logo. Algodón, ajuste metálico.', badge: 'Nuevo', stock: 10, grabable: false, activo: true },
  { id: 1, nombre: 'Mate Clásico de Madera', categoria: 'mate', precio: 4500, icono: '🧉', descripcion: 'Mate torneado artesanal, acabado natural.', badge: 'Más vendido', stock: 8, grabable: true, activo: true },
  { id: 2, nombre: 'Mate Calabaza Curada', categoria: 'mate', precio: 3800, icono: '🧉', descripcion: 'Calabaza 100% natural curada a mano.', badge: null, stock: 5, grabable: true, activo: true },
  { id: 3, nombre: 'Mate de Cerámica', categoria: 'mate', precio: 5200, icono: '🏺', descripcion: 'Cerámica artesanal pintada a mano.', badge: 'Nuevo', stock: 6, grabable: false, activo: true },
  { id: 4, nombre: 'Bombilla de Alpaca', categoria: 'bombilla', precio: 1800, icono: '🥢', descripcion: 'Filtro de alpaca, anticorrosión.', badge: null, stock: 15, grabable: false, activo: true },
  { id: 5, nombre: 'Bombilla Acero Inox', categoria: 'bombilla', precio: 2200, icono: '🥢', descripcion: 'Inoxidable, punta espiral antitaponamiento.', badge: 'Recomendada', stock: 12, grabable: false, activo: true },
  { id: 6, nombre: 'Termo Stanley 1L', categoria: 'termo', precio: 18500, icono: '🫙', descripcion: '24hs de temperatura. Negro mate.', badge: null, stock: 3, grabable: true, activo: true },
  { id: 7, nombre: 'Termo Cebador 500ml', categoria: 'termo', precio: 12000, icono: '🫙', descripcion: 'Tapa antigoteo, ideal para el día a día.', badge: 'Nuevo', stock: 7, grabable: true, activo: true },
  { id: 10, nombre: 'Grabado en Mate', categoria: 'grabado', precio: 1500, icono: '✦', descripcion: 'Grabado a láser. Subí tu imagen o texto.', badge: 'Personal.', stock: 99, grabable: true, activo: true },
  { id: 11, nombre: 'Grabado en Termo', categoria: 'grabado', precio: 2000, icono: '✦', descripcion: 'Logo o diseño personalizado a láser.', badge: 'Personal.', stock: 99, grabable: true, activo: true },
];

async function loadProducts() {
  if (typeof supabase !== 'undefined' && supabase) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });
    allProducts = error ? DEMO_PRODUCTS : data;
  } else {
    allProducts = DEMO_PRODUCTS;
  }
  renderProducts('todos');
}

function renderProducts(cat) {
  const grid = document.getElementById('pgrid');
  const list = cat === 'todos' ? allProducts : allProducts.filter(p => p.categoria === cat);
  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--muted);padding:3rem;text-align:center;grid-column:1/-1">Sin productos en esta categoría.</p>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="pcard">
      <div class="pimg">
        ${p.badge ? `<div class="pbadge">${p.badge}</div>` : ''}
        ${p.stock < 5 && p.stock < 99 ? `<div class="pstock-low">⚡ Últimos ${p.stock}</div>` : ''}
        ${p.imagen_url
          ? `<img src="${p.imagen_url}" alt="${p.nombre}">`
          : `<span class="pimg-icon">${p.icono || '📦'}</span>`}
      </div>
      <div class="pinfo">
        <p class="pcat">${p.categoria.toUpperCase()}</p>
        <h3 class="pname">${p.nombre}</h3>
        <p class="pdesc">${p.descripcion}</p>
        ${p.grabable ? '<p class="pengr">✦ Disponible con grabado personalizado</p>' : ''}
        <div class="pfoot">
          <span class="pprice">${fmt(p.precio)}</span>
          <button class="padd" onclick="addCart(${p.id})">+ Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filt(cat, btn) {
  document.querySelectorAll('.ftab button').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderProducts(cat);
}

function scrollProd() {
  document.getElementById('prod-sec').scrollIntoView({ behavior: 'smooth' });
}

// ── CARRITO ───────────────────────────────────────────────────
function addCart(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const ex = cart.find(x => x.id === id);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  updCart();
  if (!document.getElementById('cdrawer').classList.contains('open')) toggleCart();
}

function chQty(id, d) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  updCart();
}

function rmCart(id) {
  cart = cart.filter(x => x.id !== id);
  updCart();
}

function calcTotal() {
  return cart.reduce((s, i) => s + (i.precio || 0) * i.qty, 0);
}

function updCart() {
  const total = calcTotal();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cbadge');
  badge.style.display = count > 0 ? 'flex' : 'none';
  badge.textContent = count;
  document.getElementById('cd-total').textContent = fmt(total);

  const list = document.getElementById('cd-items');
  if (!cart.length) {
    list.innerHTML = '<div class="cart-empty"><span>🛒</span>Tu carrito está vacío</div>';
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="ci">
      <div class="ci-icon">
        ${item.imagen_url ? `<img src="${item.imagen_url}" alt="${item.nombre}">` : (item.icono || '📦')}
      </div>
      <div class="ci-info">
        <p class="ci-name">${item.nombre}</p>
        <p class="ci-price">${fmt((item.precio || 0) * item.qty)}</p>
        <div class="ci-qty">
          <button class="qty-btn" onclick="chQty(${item.id},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="chQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="ci-rm" onclick="rmCart(${item.id})">✕</button>
    </div>
  `).join('');
}

// ── CHECKOUT ──────────────────────────────────────────────────
function goCheckout() {
  if (!cart.length) { alert('Agregá productos al carrito primero'); return; }
  if (document.getElementById('cdrawer').classList.contains('open')) toggleCart();
  if (typeof currentUser === 'undefined' || !currentUser) { openModal('auth-modal'); return; }
  prefillCheckout();
  curStep = 1;
  showStep(1);
  openModal('checkout-modal');
}

function showStep(n) {
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('step' + i);
    if (el) el.classList.toggle('hidden', i !== n);
  }
  updateStepBar(n);
}

function updateStepBar(n) {
  for (let i = 1; i <= 4; i++) {
    const c = document.getElementById('s' + i + 'c');
    const l = document.getElementById('s' + i + 'l');
    if (!c) continue;
    c.classList.remove('done', 'active');
    l.classList.remove('active');
    if (i < n) { c.classList.add('done'); c.textContent = '✓'; }
    else if (i === n) { c.classList.add('active'); c.textContent = i; }
    else { c.textContent = i; }
    if (i === n) l.classList.add('active');
    const sl = document.getElementById('sl' + i);
    if (sl) sl.classList.toggle('done', i < n);
  }
}

function goStep(n) {
  if (n === 2) {
    const wa = document.getElementById('c-wa').value.trim();
    const dir = document.getElementById('c-dir').value.trim();
    const err = document.getElementById('s1-err');
    if (!wa || !dir) { showErr(err, 'WhatsApp y dirección son obligatorios.'); return; }
    err.style.display = 'none';
  }
  if (n === 3) buildReview();
  if (n === 4) setupMP();
  curStep = n;
  showStep(n);
}

function buildReview() {
  const nombre = document.getElementById('c-nombre').value;
  const apellido = document.getElementById('c-apellido').value;
  const wa = document.getElementById('c-wa').value;
  const dir = document.getElementById('c-dir').value;

  let rows = cart.map(i => `
    <div class="os-item">
      <span>${i.nombre} x${i.qty}</span>
      <span>${fmt((i.precio || 0) * i.qty)}</span>
    </div>`).join('');
  rows += `<div class="os-item os-total"><span>Total</span><span>${fmt(calcTotal())}</span></div>`;
  document.getElementById('review-items').innerHTML = rows;

  document.getElementById('review-addr').innerHTML = `
    <div class="os-item"><span>Nombre</span><span>${nombre} ${apellido}</span></div>
    <div class="os-item"><span>WhatsApp</span><span>${wa}</span></div>
    <div class="os-item"><span>Dirección</span><span>${dir}</span></div>
    <div class="os-item"><span>Envío</span><span style="color:#3AA066">Gratis</span></div>
  `;

  const engrWrap = document.getElementById('review-engr-wrap');
  if (engrOn) {
    engrWrap.classList.remove('hidden');
    document.getElementById('review-engr').innerHTML = `
      <div class="os-item"><span>Producto</span><span>${document.getElementById('e-prod').value || '—'}</span></div>
      <div class="os-item"><span>Texto</span><span>${document.getElementById('e-texto').value || '—'}</span></div>
      <div class="os-item"><span>Imagen</span><span>${upFile ? '✓ Cargada' : 'Sin imagen'}</span></div>
    `;
  } else engrWrap.classList.add('hidden');
}

function setupMP() {
  const num = Math.floor(Math.random() * 90000 + 10000);
  orderNum = num;
  document.getElementById('mp-amount').textContent = fmt(calcTotal());
  document.getElementById('mp-order-num').textContent = num;
  document.getElementById('s-order-num').textContent = 'PEDIDO #' + num;
  document.getElementById('mp-processing').classList.add('hidden');
  document.getElementById('mp-method-section').classList.remove('hidden');
  mpSel = null;
  document.querySelectorAll('.mp-method').forEach(m => m.classList.remove('sel'));
}

function selMP(el) {
  document.querySelectorAll('.mp-method').forEach(m => m.classList.remove('sel'));
  el.classList.add('sel');
  mpSel = el;
}

function simMP() {
  if (!mpSel) { alert('Elegí un método de pago'); return; }
  document.getElementById('mp-method-section').classList.add('hidden');
  document.getElementById('mp-processing').classList.remove('hidden');
  const bar = document.getElementById('mp-prog');
  let w = 0;
  const iv = setInterval(() => {
    w += 2;
    bar.style.width = w + '%';
    if (w >= 100) {
      clearInterval(iv);
      setTimeout(async () => {
        if (typeof savePedido !== 'undefined') {
          await savePedido({
            numero: orderNum,
            items: cart,
            total: calcTotal(),
            direccion: document.getElementById('c-dir').value,
            whatsapp: document.getElementById('c-wa').value,
            grabado: engrOn,
          });
        }
        goStep(5);
        setTimeout(() => { sendWAAdmin(); sendWAClient(); }, 1500);
      }, 400);
    }
  }, 60);
}

// ── WHATSAPP ──────────────────────────────────────────────────
function sendWAAdmin() {
  const nombre = document.getElementById('c-nombre').value;
  const apellido = document.getElementById('c-apellido').value;
  const wa = document.getElementById('c-wa').value;
  const dir = document.getElementById('c-dir').value;
  const items = cart.map(i => `- ${i.nombre} x${i.qty}: ${fmt((i.precio || 0) * i.qty)}`).join('\n');
  const grabado = engrOn ? `\n✦ Grabado en: ${document.getElementById('e-prod').value}${document.getElementById('e-texto').value ? ' — "' + document.getElementById('e-texto').value + '"' : ''}` : '';
  const waAdmin = typeof CONFIG !== 'undefined' ? CONFIG.WA_ADMIN : '5493856000000';
  const msg = `🛍️ *NUEVO PEDIDO #${orderNum} — MARIANTO MATES*\n\n👤 *Cliente:* ${nombre} ${apellido}\n📱 *WhatsApp:* ${wa}\n📍 *Dirección:* ${dir}\n\n📦 *Productos:*\n${items}${grabado}\n\n💰 *Total pagado:* ${fmt(calcTotal())}\n✅ *Pago:* Mercado Pago confirmado\n\n⚡ Coordinar envío.`;
  window.open('https://wa.me/' + waAdmin + '?text=' + encodeURIComponent(msg), '_blank');
  const btn = document.getElementById('btn-admin');
  if (btn) { btn.innerHTML = '✓ Enviado'; btn.style.opacity = '.6'; btn.disabled = true; }
}

function sendWAClient() {
  const wa = document.getElementById('c-wa').value.replace(/\D/g, '');
  const nombre = document.getElementById('c-nombre').value;
  const dir = document.getElementById('c-dir').value;
  const items = cart.map(i => `- ${i.nombre} x${i.qty}: ${fmt((i.precio || 0) * i.qty)}`).join('\n');
  const negocio = typeof CONFIG !== 'undefined' ? CONFIG.NEGOCIO_NOMBRE : 'Marianto Mates';
  const msg = `🧉 *${negocio}*\n\n¡Hola ${nombre}! Gracias por tu compra 🙌\n\n📋 *Comprobante — Pedido #${orderNum}*\n\n📦 *Tu pedido:*\n${items}\n\n💰 *Total abonado:* ${fmt(calcTotal())}\n✅ *Pago:* Mercado Pago\n📍 *Envío a:* ${dir}\n\nTe contactamos a la brevedad para coordinar el envío 🚚`;
  if (wa) window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(msg), '_blank');
  const btn = document.getElementById('btn-client');
  if (btn) { btn.innerHTML = '✓ Enviado'; btn.style.opacity = '.6'; btn.disabled = true; }
}

// ── GRABADO ───────────────────────────────────────────────────
function toggleEngr() {
  engrOn = !engrOn;
  document.getElementById('eswitch').classList.toggle('on', engrOn);
  document.getElementById('eopts').classList.toggle('vis', engrOn);
}

function doFile(e) {
  const f = e.target.files[0]; if (!f) return; upFile = f;
  const r = new FileReader();
  r.onload = ev => { document.getElementById('upreview').innerHTML = `<img src="${ev.target.result}" alt="Preview" style="max-width:100%;max-height:120px;border-radius:4px;margin-top:.5rem">`; };
  r.readAsDataURL(f);
}
function doDrop(e) { e.preventDefault(); doDragLv(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) { const dt = new DataTransfer(); dt.items.add(f); document.getElementById('ufile').files = dt.files; doFile({ target: { files: [f] } }); } }
function doDragOv(e) { e.preventDefault(); document.getElementById('uarea').classList.add('dov'); }
function doDragLv() { document.getElementById('uarea').classList.remove('dov'); }

// ── UI HELPERS ────────────────────────────────────────────────
function toggleSB() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-ov').classList.toggle('open');
}
function toggleCart() {
  document.getElementById('cdrawer').classList.toggle('open');
  document.getElementById('cd-ov').classList.toggle('open');
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function switchTab(t) {
  document.getElementById('tab-login').classList.toggle('on', t === 'login');
  document.getElementById('tab-reg').classList.toggle('on', t === 'reg');
  document.getElementById('auth-login').classList.toggle('hidden', t !== 'login');
  document.getElementById('auth-reg').classList.toggle('hidden', t !== 'reg');
}
function resetCheckout() {
  cart = []; engrOn = false; upFile = null; mpSel = null; orderNum = null;
  updCart();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updCart();
});
