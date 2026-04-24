// ============================================================
//  MARIANTO MATES — SUPABASE
//  Maneja usuarios, sesiones y pedidos
// ============================================================

// Carga el cliente de Supabase desde CDN
const _supabaseScript = document.createElement('script');
_supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
_supabaseScript.onload = () => initSupabase();
document.head.appendChild(_supabaseScript);

let supabase = null;
let currentUser = null;
let currentProfile = null;

function initSupabase() {
  supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  checkSession();
}

// Verificar si hay sesión activa
async function checkSession() {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadProfile();
    updateNavUser();
  }
}

// Cargar perfil del usuario
async function loadProfile() {
  if (!supabase || !currentUser) return;
  const { data } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  if (data) {
    currentProfile = data;
    prefillCheckout();
  }
}

// Actualizar botón de usuario en el nav
function updateNavUser() {
  const label = document.getElementById('nav-user-label');
  if (label && currentProfile) {
    label.textContent = currentProfile.nombre || 'Mi cuenta';
  }
}

// Prellenar datos del checkout con los del perfil
function prefillCheckout() {
  if (!currentProfile) return;
  const fields = {
    'c-nombre': currentProfile.nombre,
    'c-apellido': currentProfile.apellido,
    'c-wa': currentProfile.whatsapp,
    'c-email': currentUser?.email,
    'c-dir': currentProfile.direccion,
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  });
}

// LOGIN
async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass = document.getElementById('l-pass').value;
  const err = document.getElementById('l-err');
  err.style.display = 'none';

  if (!email || !pass) { showErr(err, 'Completá email y contraseña'); return; }

  if (!supabase) {
    // MODO DEMO sin Supabase conectado
    currentUser = { id: 'demo', email };
    currentProfile = { nombre: 'Usuario', apellido: '', whatsapp: '', direccion: '' };
    updateNavUser();
    closeModal('auth-modal');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) { showErr(err, 'Email o contraseña incorrectos'); return; }
  await checkSession();
  closeModal('auth-modal');
}

// REGISTRO
async function doRegister() {
  const nombre = document.getElementById('r-nombre').value.trim();
  const apellido = document.getElementById('r-apellido').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const wa = document.getElementById('r-wa').value.trim();
  const pass = document.getElementById('r-pass').value;
  const dir = document.getElementById('r-dir').value.trim();
  const err = document.getElementById('r-err');
  err.style.display = 'none';

  if (!nombre || !email || !wa || !pass || !dir) {
    showErr(err, 'Completá todos los campos obligatorios'); return;
  }
  if (pass.length < 8) { showErr(err, 'La contraseña debe tener al menos 8 caracteres'); return; }

  if (!supabase) {
    // MODO DEMO
    currentUser = { id: 'demo', email };
    currentProfile = { nombre, apellido, whatsapp: wa, direccion: dir };
    updateNavUser();
    closeModal('auth-modal');
    goCheckout();
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) { showErr(err, error.message); return; }

  // Crear perfil en la tabla perfiles
  await supabase.from('perfiles').insert({
    id: data.user.id,
    nombre, apellido,
    whatsapp: wa,
    direccion: dir,
    email,
  });

  currentUser = data.user;
  currentProfile = { nombre, apellido, whatsapp: wa, direccion: dir };
  updateNavUser();
  closeModal('auth-modal');
  goCheckout();
}

// Guardar pedido en Supabase
async function savePedido(orderData) {
  if (!supabase || !currentUser) return null;
  const { data, error } = await supabase.from('pedidos').insert({
    user_id: currentUser.id,
    numero: orderData.numero,
    items: JSON.stringify(orderData.items),
    total: orderData.total,
    direccion: orderData.direccion,
    whatsapp: orderData.whatsapp,
    grabado: orderData.grabado,
    estado: 'pagado',
  }).select().single();
  return error ? null : data;
}

function handleUserBtn() {
  if (currentUser) {
    // Si ya está logueado, mostrar opciones (logout)
    if (confirm('¿Querés cerrar sesión?')) {
      if (supabase) supabase.auth.signOut();
      currentUser = null;
      currentProfile = null;
      document.getElementById('nav-user-label').textContent = 'Ingresar';
    }
  } else {
    openModal('auth-modal');
  }
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}
