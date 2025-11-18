# Game Development Playbook - MGT300 Revision Game

This playbook documents patterns, solutions, and best practices for developing multiplayer educational games with Firebase, React, and OpenAI.

## Table of Contents
1. [Firebase Setup & Configuration](#firebase-setup--configuration)
2. [Firestore Security Rules](#firestore-security-rules)
3. [Cloud Functions Deployment](#cloud-functions-deployment)
4. [Real-time Multiplayer Features](#real-time-multiplayer-features)
5. [UI/UX Patterns](#uiux-patterns)
6. [AI Integration](#ai-integration)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## Firebase Setup & Configuration

### Initial Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
# Select: Firestore, Functions, Hosting
# Choose TypeScript for Functions
```

### Environment Variables (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_key
```

### Firebase Configuration (src/lib/firebase.ts)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// IMPORTANT: Comment out emulator connection for production
// Only use emulator when actively developing with it running
// if (import.meta.env.DEV && window.location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }
```

**Key Lesson**: Don't enable emulator connection unless you're actively running the emulator. This causes ERR_CONNECTION_REFUSED errors.

---

## Firestore Security Rules

### Multiplayer Game Rules Pattern
For games where players need to join and participate:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Allow anyone authenticated to read game data
      allow read: if request.auth != null;

      // Allow authenticated users to create games
      allow create: if request.auth != null;

      // Allow updates if:
      // 1. User is the host (professor), OR
      // 2. User is an active player in the game, OR
      // 3. User is joining for the first time (new player)
      allow update: if request.auth != null
                    && (resource.data.hostId == request.auth.uid
                        || (request.auth.uid in resource.data.players.keys()
                            && resource.data.players[request.auth.uid].isActive == true)
                        || (request.auth.uid in request.resource.data.players.keys()
                            && !(request.auth.uid in resource.data.players.keys())));
    }
  }
}
```

**Key Lessons**:
- The third condition `|| (request.auth.uid in request.resource.data.players.keys() && !(request.auth.uid in resource.data.players.keys()))` is crucial for allowing new players to join
- Without this, you get "Missing or insufficient permissions" when students try to join
- `resource.data` = current data in Firestore
- `request.resource.data` = proposed new data after the update
- Deploy rules with: `firebase deploy --only firestore:rules`

---

## Cloud Functions Deployment

### Function Structure
```
functions/
  ├── src/
  │   └── index.ts        # Main functions file
  ├── package.json
  └── tsconfig.json
```

### Common Functions Setup (functions/src/index.ts)
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Use dynamic import for node-fetch to avoid timeout issues
const getFetch = async () => {
  const module = await import('node-fetch');
  return module.default;
};

export const evaluateAnswer = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    // Your function logic
  });
```

**Key Lessons**:
- Use `runWith({ timeoutSeconds: 540, memory: '1GB' })` for AI-intensive functions
- Use dynamic imports for node-fetch: `const fetch = await getFetch();`
- Always set appropriate timeout and memory limits
- Deploy with: `firebase deploy --only functions`
- First deployment can take 10+ minutes for multiple functions
- Subsequent deployments are faster

### Environment Variables for Functions
```bash
# Set OpenAI API key for Cloud Functions
firebase functions:config:set openai.key="your_openai_key"

# View current config
firebase functions:config:get

# Deploy after setting config
firebase deploy --only functions
```

---

## Real-time Multiplayer Features

### Player Removal System

**Pattern**: Use an `isActive` flag instead of deleting player data

#### Data Structure
```typescript
interface Player {
  uid: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;  // Key field for removal
  totalScore: number;
  roundScores: { [roundNumber: number]: number };
  photoURL?: string;
}
```

#### Implementation in Lobby (Professor View)
```typescript
const handleRemovePlayer = async (playerUid: string) => {
  if (!game || !gameCode || !isAdmin) return;

  const playerToRemove = game.players[playerUid];
  if (!confirm(`¿Eliminar a "${playerToRemove?.name}" de la sala?`)) return;

  try {
    await updateDoc(doc(db, 'games', gameCode), {
      [`players.${playerUid}.isActive`]: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error removing player:', error);
    alert('Error al eliminar jugador. Intenta de nuevo.');
  }
};
```

#### UI for Remove Button
```tsx
{isAdmin && !player.isAdmin && (
  <button
    onClick={() => handleRemovePlayer(player.uid)}
    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
    title="Eliminar jugador"
  >
    <UserX className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
  </button>
)}
```

#### Detection in Student's Browser
```typescript
// In Lobby component - runs on every game state update
useEffect(() => {
  if (!isAdmin && game && playerId) {
    const currentPlayer = game.players[playerId];
    if (currentPlayer && !currentPlayer.isActive) {
      alert('Has sido eliminado de la sala por el profesor.');
      localStorage.clear();
      navigate('/');
    }
  }
}, [game, playerId, isAdmin, navigate]);
```

#### Filtering Active Players
```typescript
// Always filter by isActive when displaying player lists
const players = Object.values(game.players).filter(p => p.isActive);

// For leaderboards, also exclude admin
const players = Object.values(game.players).filter(p => p.isActive && !p.isAdmin);
```

**Key Lessons**:
- Using `isActive` flag preserves player data (scores, submissions) for professor's records
- Real-time detection through useEffect works instantly when Firestore syncs
- Always clear localStorage before redirecting removed player
- Filter by `isActive` everywhere you display player lists

---

## UI/UX Patterns

### Advanced Leaderboard with Rank Tracking

#### Calculating Rankings by Average Score
```typescript
const rankings = players
  .map(p => {
    const roundScore = p.roundScores?.[currentRound] || 0;
    const averageScore = p.totalScore / currentRound; // Key: use average, not total
    return { ...p, roundScore, averageScore };
  })
  .sort((a, b) => b.averageScore - a.averageScore);
```

#### Detecting Rank Changes
```typescript
// Calculate previous round rankings
const previousRankings = currentRound > 1 ? players
  .map(p => {
    const prevAverage = (p.totalScore - (p.roundScores?.[currentRound] || 0)) / (currentRound - 1);
    return { uid: p.uid, averageScore: prevAverage };
  })
  .sort((a, b) => b.averageScore - a.averageScore) : [];

// Add rank change indicators
const rankingsWithIndicators = rankings.map((player, index) => {
  const currentPos = index + 1;
  const prevPos = previousRankings.findIndex(p => p.uid === player.uid) + 1;

  const rankChange = prevPos > 0 ? prevPos - currentPos : 0;
  // Positive = moved up, Negative = moved down

  return { ...player, rankChange };
});
```

#### "On Fire" Status (Consecutive Improvements)
```typescript
// Calculate rankings from 2 rounds ago
const twoRoundsAgoRankings = currentRound > 2 ? players
  .map(p => {
    const twoRoundsAgoTotal = p.totalScore
      - (p.roundScores?.[currentRound] || 0)
      - (p.roundScores?.[currentRound - 1] || 0);
    const twoRoundsAgoAverage = twoRoundsAgoTotal / (currentRound - 2);
    return { uid: p.uid, averageScore: twoRoundsAgoAverage };
  })
  .sort((a, b) => b.averageScore - a.averageScore) : [];

// Detect "on fire" status
const rankingsWithIndicators = rankings.map((player, index) => {
  const currentPos = index + 1;
  const prevPos = previousRankings.findIndex(p => p.uid === player.uid) + 1;
  const twoRoundsAgoPos = twoRoundsAgoRankings.findIndex(p => p.uid === player.uid) + 1;

  let isOnFire = false;
  if (prevPos > 0 && twoRoundsAgoPos > 0) {
    const currentChange = prevPos - currentPos;
    const prevChange = twoRoundsAgoPos - prevPos;
    isOnFire = currentChange > 0 && prevChange > 0; // Both rounds improved
  }

  return { ...player, rankChange, isOnFire };
});
```

#### Display with Icons
```tsx
<td className="py-3 px-2">
  <div className="flex items-center gap-1">
    <span className="font-bold text-xl">
      {getMedalEmoji(index + 1)}
    </span>
    {player.isOnFire && (
      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
    )}
  </div>
</td>
<td className="py-3 px-2 font-semibold text-white">
  <div className="flex items-center gap-2">
    <span>{player.name}</span>
    {player.rankChange > 0 && (
      <TrendingUp className="w-4 h-4 text-green-500" />
    )}
    {player.rankChange < 0 && (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )}
  </div>
</td>
```

**Key Lessons**:
- Use average scores for fair comparison across rounds
- Calculate historical rankings by reconstructing scores without current round
- "On Fire" requires checking 2 consecutive improvements
- Visual indicators (arrows, flames) make ranking changes immediately clear

### Immediate Feedback Display

**Pattern**: Show AI feedback right after student submits, not waiting for round end

```tsx
// In Round.tsx - After submission form
{!isAdmin && mySubmission?.feedbacks && (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="mb-6"
  >
    <h2 className="text-2xl font-bold text-white mb-4">
      📊 Tu Evaluación
    </h2>
    <JudgeFeedbackDisplay
      feedbacks={mySubmission.feedbacks}
      playerName={game?.players[playerId!]?.name}
    />
    <p className="text-center text-cyan-400 text-sm mt-4">
      Espera a que el profesor avance a la siguiente ronda...
    </p>
  </motion.div>
)}
```

**Key Lessons**:
- Check for `mySubmission?.feedbacks` to know when AI evaluation is complete
- Show feedbacks immediately without waiting for professor to advance
- Keeps students engaged while waiting for others to finish

### Color Scheme Implementation

**Pattern**: Use Tailwind CSS with gradient backgrounds and consistent color palette

#### Global Styles (src/index.css)
```css
body {
  @apply bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900
         text-white min-h-screen;
}

.dramatic-card {
  @apply bg-slate-800/50 backdrop-blur-sm rounded-xl
         border border-blue-500/30 shadow-2xl;
}

.primary-button {
  @apply bg-gradient-to-r from-blue-600 to-cyan-600
         hover:from-blue-700 hover:to-cyan-700
         text-white font-bold py-2 px-6 rounded-lg
         shadow-lg hover:shadow-xl transition-all duration-300
         disabled:opacity-50 disabled:cursor-not-allowed;
}

.gradient-text {
  @apply bg-gradient-to-r from-blue-400 to-orange-400
         bg-clip-text text-transparent;
}
```

**Key Lessons**:
- Use `via-` for middle color in gradients (from-slate-900 via-blue-900 to-slate-900)
- Backdrop blur on cards creates depth
- Gradient text with bg-clip-text for headings
- Consistent hover states with transition-all
- Always include disabled states for buttons

### PDF Report Generation

**Pattern**: Use jsPDF with Cloud Function data

#### Installation
```bash
npm install jspdf
```

#### Implementation
```typescript
import jsPDF from 'jspdf';
import { httpsCallable } from 'firebase/functions';

const handleDownloadReport = async () => {
  // 1. Call Cloud Function for AI analysis
  const generateReport = httpsCallable(functions, 'generateReport');
  const result = await generateReport({ gameCode, playerId });
  const report: any = result.data;

  // 2. Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // 3. Add content with proper formatting
  doc.setFontSize(20);
  doc.setTextColor(75, 0, 130);
  doc.text('Reporte de Desempeño', margin, y);
  y += 10;

  // 4. Handle text wrapping
  const lines = doc.splitTextToSize(longText, pageWidth - 2 * margin);
  lines.forEach((line) => {
    doc.text(line, margin, y);
    y += 6;
  });

  // 5. Save file
  doc.save(`reporte_${report.playerName.replace(/\s+/g, '_')}.pdf`);
};
```

**Key Lessons**:
- Use `splitTextToSize` for automatic text wrapping
- Track y position manually for vertical spacing
- Use `setFontSize` and `setTextColor` for styling sections
- Replace spaces in filename with underscores
- Show loading state during Cloud Function call

---

## AI Integration

### OpenAI Setup with Cloud Functions

#### Configuration
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});
```

#### Multi-Judge Evaluation Pattern
```typescript
const judges = [
  {
    name: 'Dr. Estrategia',
    role: 'Experto en Estrategia Corporativa',
    systemPrompt: 'Eres un experto en estrategia corporativa...',
  },
  // ... more judges
];

// Evaluate with all judges in parallel
const evaluations = await Promise.all(
  judges.map(async (judge) => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: judge.systemPrompt },
        { role: 'user', content: `Pregunta: ${questionText}\n\nRespuesta: ${answer}` },
      ],
      temperature: 0.7,
    });

    const feedback = completion.choices[0].message.content;
    const scoreMatch = feedback.match(/PUNTAJE:\s*(\d+(\.\d+)?)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 5.0;

    return {
      judgeName: judge.name,
      score,
      feedback,
    };
  })
);

// Calculate average
const averageScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
```

**Key Lessons**:
- Use gpt-4o-mini for cost-effective evaluations
- Run multiple judges in parallel with Promise.all
- Parse scores from feedback text using regex
- Always provide default score if parsing fails
- Store individual judge feedbacks for display

### Report Generation with AI
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'Eres un profesor experto que genera reportes personalizados...',
    },
    {
      role: 'user',
      content: JSON.stringify({
        playerName,
        averageScore,
        submissions: submissionDetails,
      }),
    },
  ],
  temperature: 0.7,
});

const reportData = JSON.parse(completion.choices[0].message.content);
```

**Key Lessons**:
- Use JSON for structured input/output with AI
- Request specific format in system prompt
- Parse JSON response for structured data
- Include all relevant context (scores, submissions, questions)

---

## Common Issues & Solutions

### Issue 1: "Missing or insufficient permissions"
**Symptom**: Students can't join game, get Firestore permission error

**Cause**: Firestore rules don't allow new players to update game document

**Solution**: Add third condition to allow first-time joins
```javascript
|| (request.auth.uid in request.resource.data.players.keys()
    && !(request.auth.uid in resource.data.players.keys()))
```

### Issue 2: ERR_CONNECTION_REFUSED to localhost:5001
**Symptom**: Cloud Functions fail with connection refused error

**Cause**: Code configured to use emulator but emulator not running

**Solution**: Comment out emulator connection in firebase.ts
```typescript
// if (import.meta.env.DEV && window.location.hostname === 'localhost') {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }
```

### Issue 3: Changes not appearing after code updates
**Symptom**: UI changes don't show up in browser after editing code

**Cause**: Vite cache persisting old code

**Solution**: Clear all caches and restart
```bash
# Kill server
lsof -ti:5173 | xargs kill -9

# Clear caches
rm -rf node_modules/.vite .vite dist

# Restart
npm run dev -- --host

# In browser: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
```

### Issue 4: Cloud Functions timeout during deployment
**Symptom**: Deployment hangs or fails with timeout

**Cause**: Large dependencies or multiple functions deploying at once

**Solution**:
- Use dynamic imports for large dependencies
- Increase timeout in runWith options
- Deploy functions individually if needed
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onCall(async (data, context) => {
    const fetch = await getFetch(); // Dynamic import
    // ...
  });
```

### Issue 5: Removed player stays on screen
**Symptom**: When professor removes student, student's browser doesn't update

**Cause**: No client-side detection of removal

**Solution**: Add useEffect to monitor isActive status
```typescript
useEffect(() => {
  if (!isAdmin && game && playerId) {
    const currentPlayer = game.players[playerId];
    if (currentPlayer && !currentPlayer.isActive) {
      alert('Has sido eliminado de la sala por el profesor.');
      localStorage.clear();
      navigate('/');
    }
  }
}, [game, playerId, isAdmin, navigate]);
```

---

## Development Workflow

### Standard Development Flow
1. Make code changes
2. Test in browser (auto-reload with Vite)
3. If changes don't appear: clear cache and hard refresh
4. Test multiplayer features with incognito window
5. Deploy to Firebase when ready

### Testing Multiplayer Features
1. Open app as professor in normal browser
2. Open app as student in incognito window
3. Test both perspectives simultaneously
4. Check real-time synchronization

### Deployment Checklist
- [ ] Update Firestore rules if data structure changed
- [ ] Deploy Cloud Functions if backend logic changed
- [ ] Build and deploy hosting
- [ ] Test in production environment
- [ ] Verify environment variables are set

```bash
# Deploy everything
firebase deploy

# Or deploy selectively
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

---

## Best Practices

### State Management
- Use Firestore as single source of truth
- Listen to real-time updates with onSnapshot
- Store minimal state in localStorage (gameCode, playerId, isAdmin)
- Clear localStorage when player leaves/removed

### Error Handling
- Always wrap Firebase operations in try-catch
- Show user-friendly error messages
- Log errors to console for debugging
- Provide fallback values for missing data

### Performance
- Filter data client-side when possible (isActive, isAdmin)
- Use indexes for complex Firestore queries
- Lazy load heavy components
- Use dynamic imports for large dependencies

### Security
- Never expose API keys in client code (use env variables)
- Always validate user permissions in Firestore rules
- Use Cloud Functions for sensitive operations
- Check authentication in all Cloud Functions

### Code Organization
- Group related components in folders
- Separate business logic into hooks
- Keep components focused on single responsibility
- Use TypeScript interfaces for data structures

---

## Future Enhancements Ideas

### Features to Consider
- [ ] Persist game history in Firestore collection
- [ ] Professor dashboard to view all past games
- [ ] Student profile with cumulative stats
- [ ] Export all student reports as ZIP
- [ ] Live game analytics during gameplay
- [ ] Custom question import from CSV/JSON
- [ ] Adjustable round timer
- [ ] Team mode (students in groups)
- [ ] Achievement badges for milestones
- [ ] In-game chat or reactions

### Technical Improvements
- [ ] Add proper TypeScript types throughout
- [ ] Unit tests for game logic
- [ ] E2E tests for critical flows
- [ ] Better error boundaries
- [ ] Loading states for all async operations
- [ ] Optimistic UI updates
- [ ] Offline support with Firestore persistence
- [ ] PWA for mobile installation

---

## Resources

### Documentation
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [OpenAI API](https://platform.openai.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

### Libraries Used
- React + TypeScript
- Firebase (Auth, Firestore, Functions)
- OpenAI (gpt-4o-mini)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- jsPDF (PDF generation)
- React Router (navigation)

---

## Version History

### v1.0 - Initial Release
- Multiplayer game system
- AI judge evaluation
- Real-time leaderboard
- PDF reports
- Player removal system
- Immediate feedback display
- Rank tracking with "on fire" status

---

*Last Updated: 2025-01-18*
