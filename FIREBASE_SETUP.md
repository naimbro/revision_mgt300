# 🔥 Guía Completa de Setup de Firebase

Esta guía te llevará paso a paso para configurar Firebase para el juego MGT300.

## 📋 Requisitos Previos

- Cuenta de Google (naim.bro@gmail.com)
- Node.js instalado
- Firebase CLI instalado globalmente: `npm install -g firebase-tools`
- API Key de OpenAI (para evaluación con IA)

---

## Paso 1: Crear Proyecto en Firebase Console

1. Ve a https://console.firebase.google.com
2. Click en **"Agregar proyecto"** o **"Add project"**
3. Nombre del proyecto: `revision-mgt300`
4. Google Analytics: **Opcional** (puedes deshabilitarlo para ir más rápido)
5. Click **"Crear proyecto"** y espera ~30 segundos

---

## Paso 2: Habilitar Authentication

1. En el menú lateral, click en **"Authentication"**
2. Click **"Get started"** o **"Comenzar"**
3. En la pestaña **"Sign-in method"**:

   **a) Habilitar Google:**
   - Click en **"Google"**
   - Toggle **"Enable"** → ON
   - Email de soporte: `naim.bro@gmail.com`
   - Click **"Save"**

   **b) Habilitar Anonymous:**
   - Click en **"Anonymous"**
   - Toggle **"Enable"** → ON
   - Click **"Save"**

---

## Paso 3: Crear Firestore Database

1. En el menú lateral, click en **"Firestore Database"**
2. Click **"Create database"**
3. **Mode**: Selecciona **"Start in production mode"**
   - (Usaremos reglas personalizadas que ya están en `firestore.rules`)
4. **Location**: Selecciona **"us-central"** o la región más cercana
5. Click **"Enable"**

---

## Paso 4: Registrar Web App

1. En el menú lateral, click en **"Project Overview"** (icono de engranaje) → **"Project settings"**
2. Scroll down a la sección **"Your apps"**
3. Click en el ícono **</>** (Web)
4. **App nickname**: `revision-mgt300-web`
5. **Firebase Hosting**: **NO** marcar (usaremos GitHub Pages)
6. Click **"Register app"**
7. **IMPORTANTE**: Verás un código con `firebaseConfig`. Copia estos valores:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "revision-mgt300.firebaseapp.com",
  projectId: "revision-mgt300",
  storageBucket: "revision-mgt300.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Paso 5: Crear `.env.local`

En la raíz del proyecto, crea el archivo `.env.local` con las credenciales:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=revision-mgt300.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=revision-mgt300
VITE_FIREBASE_STORAGE_BUCKET=revision-mgt300.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**⚠️ IMPORTANTE**: Este archivo NO debe ser commiteado a Git (ya está en `.gitignore`)

---

## Paso 6: Inicializar Firebase CLI

En la terminal, desde la raíz del proyecto:

```bash
# Login a Firebase
firebase login

# Inicializar proyecto (seleccionar proyecto existente)
firebase use revision-mgt300

# Verificar configuración
firebase projects:list
```

---

## Paso 7: Desplegar Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Esto desplegará las reglas de seguridad desde `firestore.rules`.

**Verificar**: Ve a Firebase Console → Firestore Database → Rules, deberías ver:
```
match /games/{gameCode} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && ...
  ...
}
```

---

## Paso 8: Configurar Authorized Domains

Para que funcione en GitHub Pages:

1. Firebase Console → Authentication → Settings
2. Tab **"Authorized domains"**
3. Click **"Add domain"**
4. Agregar: `naimbro.github.io`
5. Click **"Add"**

*Nota*: `localhost` ya está autorizado por defecto.

---

## Paso 9: Setup Cloud Functions

### 9.1 Instalar dependencias

```bash
cd functions
npm install
cd ..
```

### 9.2 Configurar OpenAI API Key

**Opción A: Desarrollo Local**

Crea `functions/.env`:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**⚠️ IMPORTANTE**: Este archivo NO debe ser commiteado (ya está en `functions/.gitignore`)

**Opción B: Producción**

```bash
firebase functions:config:set openai.key="sk-proj-xxxxxxxxxxxxx"

# Verificar
firebase functions:config:get
```

Deberías ver:
```json
{
  "openai": {
    "key": "sk-proj-xxxxxxxxxxxxx"
  }
}
```

### 9.3 Compilar Functions

```bash
cd functions
npm run build
cd ..
```

Si hay errores, revisa que:
- `node-fetch@2` esté instalado
- `@types/node-fetch` esté instalado
- No haya errores de TypeScript

---

## Paso 10: Test Local (Opcional pero Recomendado)

### Test Frontend Solo

```bash
npm run dev
```

Abre http://localhost:5173

**Limitación**: No podrás evaluar respuestas (porque las Cloud Functions no están corriendo).

### Test Frontend + Backend

**Terminal 1:**
```bash
npm run dev -- --host
```

**Terminal 2:**
```bash
firebase emulators:start --only functions
```

Esto iniciará:
- Frontend en http://localhost:5173
- Firebase Emulator UI en http://localhost:4000
- Functions en http://localhost:5001

**Probar**:
1. Crear juego como profesor
2. Unirse como estudiante
3. Responder una pregunta
4. Verificar que se evalúe correctamente

---

## Paso 11: Deploy Cloud Functions a Producción

```bash
firebase deploy --only functions
```

Este proceso puede tomar 2-5 minutos.

**Verificar**: Ve a Firebase Console → Functions, deberías ver:
- `evaluateAnswer`
- `generateReport`

---

## Paso 12: Setup GitHub Pages

### 12.1 Crear Repositorio

1. Ve a https://github.com/naimbro
2. Click **"New repository"**
3. Nombre: `revision_mgt300`
4. Visibilidad: **Public**
5. Click **"Create repository"**

### 12.2 Configurar Secrets

1. En el repo, ve a **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Agregar cada uno de estos secrets:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `revision-mgt300.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `revision-mgt300` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `revision-mgt300.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abcdef` |

**⚠️ NO agregues `OPENAI_API_KEY` aquí** - solo va en Cloud Functions.

### 12.3 Configurar GitHub Pages

1. Settings → Pages
2. **Source**: GitHub Actions
3. Save

### 12.4 Push Inicial

```bash
git init
git add .
git commit -m "Initial commit: MGT300 revision game"
git branch -M main
git remote add origin https://github.com/naimbro/revision_mgt300.git
git push -u origin main
```

El workflow de GitHub Actions se ejecutará automáticamente.

**Verificar**: Ve a Actions en GitHub, deberías ver el workflow corriendo.

Cuando termine (2-3 minutos), tu juego estará en:
`https://naimbro.github.io/revision_mgt300/`

---

## ✅ Checklist Final

Antes de usar el juego en producción, verifica:

- [ ] Proyecto creado en Firebase Console
- [ ] Authentication habilitado (Google + Anonymous)
- [ ] Firestore Database creado
- [ ] Web App registrada en Firebase
- [ ] `.env.local` creado con credenciales
- [ ] Firestore Rules desplegadas (`firebase deploy --only firestore:rules`)
- [ ] Authorized domains configurado (naimbro.github.io)
- [ ] Cloud Functions instaladas (`cd functions && npm install`)
- [ ] OpenAI API Key configurada (local: `functions/.env`, prod: `firebase functions:config:set`)
- [ ] Cloud Functions desplegadas (`firebase deploy --only functions`)
- [ ] Repositorio GitHub creado
- [ ] Secrets configurados en GitHub Actions
- [ ] GitHub Pages configurado
- [ ] Push a GitHub exitoso
- [ ] Deployment de GitHub Pages exitoso

---

## 🐛 Troubleshooting Común

### Error: "Cannot read properties of undefined"
- **Causa**: `.env.local` no configurado o mal formateado
- **Solución**: Verifica que todas las variables empiecen con `VITE_`

### Error: "Permission denied" en Firestore
- **Causa**: Reglas no desplegadas
- **Solución**: `firebase deploy --only firestore:rules`

### Error: "OpenAI API Key not configured"
- **Causa**: API key no configurada en Functions
- **Solución**: `firebase functions:config:set openai.key="sk-proj-..."`

### Error: Functions no responden
- **Causa**: Functions no desplegadas
- **Solución**: `firebase deploy --only functions`

### Error: "Authorized domain not allowed"
- **Causa**: Dominio no autorizado en Firebase Auth
- **Solución**: Agregar dominio en Firebase Console → Authentication → Settings → Authorized domains

---

## 💰 Estimación de Costos

### Firebase (Free Tier)
- Firestore: 50,000 reads/day gratis
- Authentication: Ilimitado gratis
- Functions: 2M invocations/mes gratis

**Estimación**: Gratis para ~500 jugadores/mes

### OpenAI
- Modelo: `gpt-4o-mini`
- Costo: ~$0.001 por respuesta
- 20 preguntas × 30 estudiantes = 600 respuestas = **~$0.60 USD por clase**

**Total**: ~$2-3 USD/mes para uso moderado

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa Firebase Console → Functions → Logs
3. Verifica que todas las variables estén configuradas
4. Consulta el `README.md` principal

---

**¡Todo listo! El juego está configurado y listo para usar.** 🎉
