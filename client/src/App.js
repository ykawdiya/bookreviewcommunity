import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import BookDetails from './pages/BookDetails';
import NotFound from './pages/NotFound';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    console.error("❌ Google Client ID is missing! Authentication may not work.");
}

function App() {
  if (!googleClientId) {
    return <h1 style={{ textAlign: "center", color: "red" }}>Google Authentication is unavailable.</h1>;
  }

  return (
    <Router>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;