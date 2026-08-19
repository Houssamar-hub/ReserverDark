
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;