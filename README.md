# 🧉 Marianto Mates — Instrucciones de publicación

## Estructura de archivos

```
marianto-mates/
├── index.html          ← Tienda pública
├── css/
│   └── styles.css      ← Estilos
├── js/
│   ├── config.js       ← ⚙️ CONFIGURACIÓN (editá esto primero)
│   ├── supabase.js     ← Manejo de usuarios y sesiones
│   └── store.js        ← Lógica de productos, carrito y checkout
├── admin/
│   └── index.html      ← Panel de administración
├── img/
│   └── logo.png        ← ⚠️ Copiá acá el logo
└── supabase-setup.sql  ← Script para crear las tablas
```

---

## PASO 1 — Subir el logo

Copiá el archivo del logo como `img/logo.png`.

---

## PASO 2 — Crear cuenta en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratis
2. Creá un nuevo proyecto (nombre: `marianto-mates`)
3. Esperá que termine de configurarse (~2 min)
4. Andá a **SQL Editor** y pegá todo el contenido de `supabase-setup.sql` → Run
5. Andá a **Settings → API** y copiá:
   - **Project URL** → `https://XXXXXXXXXX.supabase.co`
   - **anon public key** → la clave larga

---

## PASO 3 — Configurar el proyecto

Abrí `js/config.js` y reemplazá los valores:

```javascript
SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',  // ← pegá la URL
SUPABASE_KEY: 'eyJhbGci...',                        // ← pegá la clave
WA_ADMIN: '5493856XXXXXX',                          // ← tu número de WhatsApp
```

**Formato del número de WhatsApp:**
- Argentina: `54` + `9` + número sin el 0 inicial
- Ejemplo: si tu número es `385 600-0000` → ponés `5493856000000`

---

## PASO 4 — Crear la cuenta de admin en Supabase

1. Andá a **Supabase → Authentication → Users → Add user**
2. Poné el email y contraseña que van a usar los dueños
3. En `admin/index.html` línea donde dice `admin@mariantomates.com`, reemplazalo por ese email

---

## PASO 5 — Subir a GitHub

1. Creá una cuenta en [github.com](https://github.com) si no tenés
2. Creá un repositorio nuevo (nombre: `marianto-mates`, público)
3. Subí todos los archivos de esta carpeta al repositorio

---

## PASO 6 — Publicar con Vercel

1. Creá cuenta en [vercel.com](https://vercel.com) con tu cuenta de GitHub
2. Hacé click en **Add New Project**
3. Elegí el repositorio `marianto-mates`
4. Hacé click en **Deploy**
5. En ~1 minuto la tienda está online en `marianto-mates.vercel.app`

---

## PASO 7 — Traspaso a los dueños

Cuando quieras desvincularte:

1. **Supabase:** Los dueños crean su propia cuenta en supabase.com y seguís el Paso 2 de nuevo. O bien cambian la contraseña del usuario admin.
2. **GitHub:** Transferís el repositorio desde Settings → Transfer.
3. **Vercel:** Los dueños crean cuenta y re-conectan el repositorio de GitHub.
4. **WhatsApp:** Cambian el número en `js/config.js`.

Con eso, vos quedás completamente desvinculado. Los dueños manejan todo desde el panel admin y no necesitan tocar código nunca más.

---

## Cómo usar el panel admin

Entrá a: `https://tu-sitio.vercel.app/admin`

Desde ahí los dueños pueden:
- **Agregar/editar productos** con foto, precio y stock
- **Pausar un producto** cuando se queda sin stock (sin eliminarlo)
- **Ver todos los pedidos** con estado: Pagado → Enviado → Entregado
- **Contactar clientes** por WhatsApp con un solo click

---

## Modo demo (sin Supabase)

La tienda funciona con datos de ejemplo aunque no hayas configurado Supabase todavía.
Para probar el panel admin sin Supabase:
- Email: `admin@marianto.com`
- Contraseña: `admin123`

---

## Soporte

Ante cualquier duda, toda la lógica está comentada en los archivos JS.
El código es limpio y fácil de editar. ¡Éxitos con la tienda! 🧉
