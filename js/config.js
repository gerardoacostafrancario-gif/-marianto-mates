// ============================================================
//  MARIANTO MATES — CONFIGURACIÓN
//  Editá este archivo para conectar Supabase y WhatsApp
// ============================================================

const CONFIG = {

  // --- SUPABASE ---
  // Conseguís estos datos en: supabase.com → tu proyecto → Settings → API
  SUPABASE_URL: 'https://XXXXXXXXXX.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXX',

  // --- WHATSAPP DEL NEGOCIO (número del admin) ---
  // Formato: código de país + número sin espacios ni guiones
  // Ejemplo Argentina: 5493856123456 (54 + 9 + número sin 0)
  WA_ADMIN: '5493856000000',

  // --- NOMBRE Y DATOS DEL NEGOCIO ---
  NEGOCIO_NOMBRE: 'Marianto Mates',
  NEGOCIO_INSTAGRAM: '@mariantomates',
  NEGOCIO_URL: 'https://mariantomates.vercel.app',

  // --- MERCADO PAGO ---
  // Cuando integres MP, poné tu Public Key acá
  MP_PUBLIC_KEY: 'TEST-XXXXXXXX',

};
