# 🎮 MGT300 - Revisión Unidad 2

Juego educativo multiplayer para la semana de preparación de la prueba de MGT300, Módulo 2.

## 🎯 Características

- 🎓 **20 preguntas** sobre 4 temas: Destrucción Creativa, Desigualdad, Instituciones y Antropoceno
- 🤖 **3 Jueces de IA** que evalúan cada respuesta:
  - **Profe Naim**: Análisis causal y claridad conceptual
  - **Ayudante Mariela**: Evidencia empírica y estudios reales
  - **Ayudante Carlos**: Enfoque institucional-político
- 📊 **Feedback personalizado** en tiempo real
- 🏆 **Sistema de rankings** y podio olímpico
- 👨‍🏫 **Controles de profesor**: Pausar, avanzar rondas, terminar juego
- 📱 **Mobile-first**: Funciona perfectamente en celulares

## 🚀 Setup del Proyecto

### 1. Instalar dependencias

```bash
npm install
cd functions
npm install
cd ..
```

### 2. Configurar Firebase

**IMPORTANTE**: Debes crear un proyecto en Firebase Console y configurar las credenciales.

Ver instrucciones completas en: `FIREBASE_SETUP.md`

Resumen:
1. Crear proyecto en https://console.firebase.google.com
2. Habilitar Authentication (Google + Anonymous)
3. Crear Firestore Database
4. Copiar credenciales a `.env.local`
5. Desplegar reglas: `firebase deploy --only firestore:rules`
6. Configurar OpenAI API key para Cloud Functions

### 3. Desarrollo Local

**Opción A: Solo Frontend** (sin evaluación de IA)
```bash
npm run dev
```

**Opción B: Frontend + Backend** (con evaluación de IA)

Terminal 1:
```bash
npm run dev -- --host
```

Terminal 2:
```bash
firebase emulators:start --only functions
```

Acceder a:
- Frontend: http://localhost:5173
- Emulador UI: http://localhost:4000

### 4. Deploy a GitHub Pages

1. Crear repositorio en GitHub: `https://github.com/naimbro/revision_mgt300`
2. Configurar GitHub Pages en Settings → Pages
3. Agregar Secrets en Settings → Secrets → Actions:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Push a main y el workflow se ejecutará automáticamente

### 5. Deploy de Cloud Functions

```bash
# Configurar OpenAI API key
firebase functions:config:set openai.key="sk-proj-xxxxx"

# Desplegar functions
firebase deploy --only functions
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Timer.tsx       # Timer con pausa
│   ├── JudgeCard.tsx   # Card de evaluación de juez
│   ├── JudgeFeedbackDisplay.tsx
│   └── JudgeScoreReveal.tsx
├── pages/              # Páginas principales
│   ├── Home.tsx
│   ├── CreateGame.tsx
│   ├── JoinGame.tsx
│   ├── Lobby.tsx
│   ├── Round.tsx
│   ├── Results.tsx
│   └── End.tsx
├── lib/                # Lógica de negocio
│   ├── firebase.ts
│   ├── gameLogic.ts
│   └── audio.ts
├── hooks/              # Custom hooks
│   └── useGame.ts
├── types/              # Tipos TypeScript
│   └── game.ts
└── data/               # Datos del juego
    ├── questions.ts    # Banco de 20 preguntas
    └── judges.ts       # Información de jueces

functions/
└── src/
    └── index.ts        # Cloud Functions (evaluateAnswer, generateReport)
```

## 🎮 Flujo del Juego

1. **Profesor** crea juego (login con Google) → Obtiene código de 6 caracteres
2. **Estudiantes** se unen con el código (login anónimo + nombre)
3. **Lobby** - Profesor inicia cuando todos están listos
4. **Round** - Estudiantes responden pregunta en 5 minutos
5. **Evaluación** - 3 jueces de IA evalúan cada respuesta
6. **Results** - Se muestra leaderboard y feedback personalizado
7. Repetir pasos 4-6 para las 20 preguntas
8. **End** - Podio olímpico final con clasificación completa

## 👨‍🏫 Controles de Profesor

Durante cada ronda, el profesor puede:
- ⏸️ **Pausar/Reanudar** el timer
- ⏭️ **Avanzar** a resultados (sin esperar el tiempo completo)
- 🏆 **Terminar juego** en cualquier momento

## 🤖 Sistema de Evaluación

Cada respuesta es evaluada por 3 jueces especializados:

### Profe Naim (Digital Twin)
- Evalúa: Claridad causal, rigor conceptual, precisión
- Peso: Igual (33%)

### Ayudante Mariela (Evidencia Empírica)
- Evalúa: Uso de datos, ejemplos reales, estudios
- Peso: Igual (33%)

### Ayudante Carlos (Institucional-Político)
- Evalúa: Conexión con instituciones, poder, historia
- Peso: Igual (33%)

**Puntaje final**: Promedio de los 3 jueces (0-100)

## 📊 Temas y Preguntas

### Tema A: Destrucción Creativa e Innovación (6 preguntas)
- Innovación y crecimiento
- Empresas incumbentes
- Competencia
- Desigualdad temporal
- Innovación radical vs incremental
- Políticas públicas

### Tema B: Desigualdad y Movilidad Social (4 preguntas)
- Top 1% vs desigualdad general
- Great Gatsby Curve
- Innovación y desigualdad
- Movilidad intergeneracional

### Tema C: Instituciones y Desarrollo (5 preguntas)
- Instituciones inclusivas vs extractivas
- Divergencia de países
- Coyunturas críticas
- Caso de las Coreas
- Concentración de poder

### Tema D: Antropoceno y Sostenibilidad (5 preguntas)
- Gran Aceleración
- Dimensiones del Antropoceno
- Evidencia empírica
- Instituciones y sostenibilidad
- Transición energética

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase Cloud Functions
- **Database**: Firestore (tiempo real)
- **Auth**: Firebase Auth (Google + Anonymous)
- **IA**: OpenAI GPT-4o-mini
- **Deployment**: GitHub Pages + Firebase Hosting

## 📝 Notas Importantes

1. **API Keys**: Nunca commitear `.env.local` o `functions/.env`
2. **Costos**: Cada respuesta consume ~3 llamadas a OpenAI (~$0.003 USD)
3. **Rate Limiting**: Considerar límites de Firebase y OpenAI en producción
4. **Mobile**: Toda la UI es responsive, diseñada para celulares

## 🐛 Troubleshooting

### Error: "Cannot find module 'firebase/app'"
```bash
npm install firebase@^11.0.0
```

### Error: Cambios no se reflejan en el navegador
```bash
rm -rf .vite node_modules/.vite dist
npm run dev
```

### Error: Cloud Functions timeout
```bash
cd functions
npm install node-fetch@2
npm install -D @types/node-fetch
npm run build
```

## 📚 Recursos

- [Documentación Firebase](https://firebase.google.com/docs)
- [Documentación OpenAI](https://platform.openai.com/docs)
- [GAME_DEVELOPMENT_PLAYBOOK.md](../GAME_DEVELOPMENT_PLAYBOOK.md)

## 👨‍💻 Autor

Desarrollado por Claude Code siguiendo el Game Development Playbook.

## 📄 Licencia

MIT License - Uso educativo para MGT300
