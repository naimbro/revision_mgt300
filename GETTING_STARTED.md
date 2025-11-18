# 🚀 Próximos Pasos - Guía Rápida

El proyecto está completamente implementado. Sigue estos pasos para ponerlo en funcionamiento.

## ⚡ Inicio Rápido (5 minutos)

### 1. Verificar que las dependencias estén instaladas

```bash
npm install
cd functions
npm install
cd ..
```

### 2. Test local rápido (sin backend)

```bash
npm run dev
```

Abre http://localhost:5173 y verás la pantalla principal.

**Nota**: En este modo NO funcionará la evaluación con IA (necesitas configurar Firebase).

---

## 🔥 Setup Completo de Firebase (30 minutos)

Para tener el juego completamente funcional con evaluación de IA, sigue la guía completa:

📖 **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Guía paso a paso

**Resumen de pasos**:
1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Google + Anonymous)
3. Crear Firestore Database
4. Copiar credenciales a `.env.local`
5. Configurar OpenAI API key
6. Desplegar Cloud Functions
7. (Opcional) Deploy a GitHub Pages

---

## 🎯 Archivos que DEBES configurar

### ✅ Obligatorio para desarrollo local:

1. **`.env.local`** (en la raíz del proyecto)
   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

2. **`functions/.env`** (para desarrollo local de Cloud Functions)
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```

3. **`.firebaserc`**
   - Ya está creado, pero debes actualizar el `projectId` si usas un nombre diferente:
   ```json
   {
     "projects": {
       "default": "tu-proyecto-id"
     }
   }
   ```

### ✅ Obligatorio para producción:

4. **GitHub Secrets** (en Settings → Secrets)
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. **Firebase Functions Config** (en producción)
   ```bash
   firebase functions:config:set openai.key="sk-proj-xxxxx"
   ```

---

## 🧪 Test Completo Local (con backend)

Una vez configurado Firebase y OpenAI:

**Terminal 1** (Frontend):
```bash
npm run dev -- --host
```

**Terminal 2** (Backend - Cloud Functions):
```bash
firebase emulators:start --only functions
```

Luego:
1. Abre http://localhost:5173
2. Crea un juego como profesor (login con Google)
3. Únete como estudiante en otra ventana/dispositivo
4. Responde una pregunta
5. Verifica que los 3 jueces evalúen correctamente

---

## 📦 Deploy a Producción

### Deploy de Cloud Functions:
```bash
firebase deploy --only functions
```

### Deploy del Frontend (GitHub Pages):
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

El workflow de GitHub Actions desplegará automáticamente a:
`https://naimbro.github.io/revision_mgt300/`

---

## 📚 Documentación Adicional

- **[README.md](./README.md)** - Documentación general del proyecto
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Setup detallado de Firebase
- **[../GAME_DEVELOPMENT_PLAYBOOK.md](../GAME_DEVELOPMENT_PLAYBOOK.md)** - Patrones y aprendizajes

---

## 🎮 Estructura del Juego

### Flujo del Juego:
```
Home → CreateGame (Profesor) → Lobby → Round 1 → Results 1 →
Round 2 → Results 2 → ... → Round 20 → Results 20 → End (Podio)
                ↑
Home → JoinGame (Estudiantes) ┘
```

### Roles:
- **Profesor**: Crea juego, controla rondas (pausar, avanzar, terminar)
- **Estudiantes**: Responden preguntas, reciben evaluación de 3 jueces IA

### Evaluación:
Cada respuesta es evaluada por:
1. **Profe Naim** - Claridad conceptual y rigor teórico
2. **Ayudante Mariela** - Evidencia empírica
3. **Ayudante Carlos** - Análisis institucional-político

Puntaje final = Promedio de los 3 jueces (0-100)

---

## ⚙️ Configuración del Juego

### Cambiar número de preguntas:
Edita `src/data/questions.ts` - El array `questions` define todas las preguntas.
El juego usa automáticamente `questions.length` como número total de rondas.

### Cambiar tiempo por ronda:
Edita `src/pages/Round.tsx` - Línea ~11:
```typescript
const ROUND_DURATION = 5 * 60 * 1000; // 5 minutos en ms
```

### Modificar jueces:
Edita:
- `src/data/judges.ts` - Info visual de jueces
- `functions/src/index.ts` - Prompts de evaluación

---

## 🐛 Solución de Problemas Comunes

### "Cannot find module 'firebase/app'"
```bash
npm install
```

### "OpenAI API Key not configured"
- Local: Crear `functions/.env` con `OPENAI_API_KEY=...`
- Producción: `firebase functions:config:set openai.key="..."`

### "Permission denied" en Firestore
```bash
firebase deploy --only firestore:rules
```

### Cambios no se reflejan en el navegador
```bash
rm -rf .vite node_modules/.vite dist
npm run dev
```

---

## ✅ Checklist de Verificación

Antes de usar en clase:

- [ ] `.env.local` creado con credenciales Firebase
- [ ] `functions/.env` creado con OpenAI API key
- [ ] Firestore rules desplegadas
- [ ] Cloud Functions desplegadas
- [ ] Test local exitoso (profesor + estudiante)
- [ ] GitHub Pages desplegado (opcional)

---

## 💡 Tips para Uso en Clase

1. **Antes de la clase**:
   - Verifica que el juego esté desplegado y funcionando
   - Ten el código del juego listo (se genera al crearlo)
   - Prepara pantalla para proyectar el código

2. **Durante la clase**:
   - Crea el juego como profesor
   - Proyecta el código para que los estudiantes lo vean
   - Espera en el Lobby a que todos se unan
   - Usa los controles de profesor según necesites (pausar para explicar, avanzar si todos terminaron, etc.)

3. **Después de la clase**:
   - Los resultados quedan guardados en Firestore
   - Puedes acceder a Firestore Console para ver estadísticas
   - (Futuro) Generar informes personalizados por estudiante

---

## 📞 Soporte

Si tienes problemas:
1. Revisa el `README.md` y `FIREBASE_SETUP.md`
2. Verifica la consola del navegador (F12 → Console)
3. Revisa Firebase Console → Functions → Logs
4. Consulta el playbook: `../GAME_DEVELOPMENT_PLAYBOOK.md`

---

**¡Listo para usar! 🎉**

El juego está 100% implementado y listo para configurar. Sigue los pasos arriba y tendrás el juego funcionando en minutos.
