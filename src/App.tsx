import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SupabaseAlertBanner } from './components/SupabaseAlertBanner';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#FDF5F8] text-[#374151] font-sans selection:bg-pink-200 selection:text-pink-900">
          <SupabaseAlertBanner />
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
