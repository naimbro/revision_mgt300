import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import Lobby from './pages/Lobby';
import Round from './pages/Round';
import Results from './pages/Results';
import End from './pages/End';

export default function App() {
  return (
    <BrowserRouter basename="/revision_mgt300">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/round/:roundNumber" element={<Round />} />
        <Route path="/results/:roundNumber" element={<Results />} />
        <Route path="/end" element={<End />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
