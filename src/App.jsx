import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import UserNameModal from './components/UserNameModal';
import { getUserName, setUserName } from './utils/user';

export default function App() {
  // Lazily read from localStorage — false if no name yet
  const [hasName, setHasName] = useState(() => Boolean(getUserName()));

  function handleNameSubmit(name) {
    setUserName(name);
    setHasName(true);
  }

  return (
    <BrowserRouter>
      {/* Blocking gate: show name modal until user has set a name */}
      {!hasName && <UserNameModal onSubmit={handleNameSubmit} />}

      <Routes>
        <Route path="/"              element={<HomePage />} />
        <Route path="/trip/:tripId"  element={<TripPage />} />
      </Routes>
    </BrowserRouter>
  );
}
