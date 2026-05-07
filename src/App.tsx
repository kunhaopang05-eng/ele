import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { QuestionBank } from './pages/QuestionBank';
import { ExamConfig } from './pages/ExamConfig';
import { ExamSession } from './pages/ExamSession';
import { Login } from './pages/Login';

import { Stats } from './pages/Stats';
import { Profile } from './pages/Profile';
import { WrongQuestions } from './pages/WrongQuestions';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-[3rem] m-8 border border-slate-200 shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6 bg-red-50 p-4 rounded-full" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">页面运行出现异常</h2>
          <p className="text-slate-500 mb-8 max-w-md">很抱歉，当前内容无法正常显示。这可能是由于临时加载错误导致的。</p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <RefreshCw size={18} />
            <span>重新加载系统</span>
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

function AuthenticatedLayout() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc]">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bank" element={<QuestionBank />} />
        <Route path="/exam-config" element={<ExamConfig />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wrong" element={<WrongQuestions />} />
        <Route path="/exam-session" element={<ExamSession />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
