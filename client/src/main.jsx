import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import './index.css';
import App from './App.jsx';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1234567890-placeholder.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
