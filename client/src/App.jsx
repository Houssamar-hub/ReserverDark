import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ToasterWithTheme() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: isDark ? '#1a1a1a' : '#ffffff',
          color: isDark ? '#f5f5f5' : '#111111',
          border: isDark ? '1px solid #2a2a2a' : '1px solid #e5e5e5',
          boxShadow: isDark
            ? '0 10px 25px rgba(0,0,0,0.5)'
            : '0 10px 25px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: isDark ? '#1a1a1a' : '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#1a1a1a' : '#fff' } },
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <ToasterWithTheme />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;