import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import theme store so its module-level side effect (reading localStorage + setting data-theme) runs before first paint
import './store/theme.store';
import AuthGuard from './components/layout/AuthGuard';
import DashboardPage from './pages/DashboardPage';
import FoldersPage from './pages/FoldersPage';
import FolderPage from './pages/FolderPage';
import ListPage from './pages/ListPage';
import DailyPage from './pages/DailyPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

import AiChatPanel from './components/AiChat/AiChatPanel';

function GuardedRoutes() {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/folders" element={<FoldersPage />} />
        <Route path="/folders/:folderId" element={<FolderPage />} />
        <Route path="/list/:listId" element={<ListPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <AiChatPanel />
    </AuthGuard>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<GuardedRoutes />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
