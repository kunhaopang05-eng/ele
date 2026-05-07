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

function AuthenticatedLayout() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc] flex flex-col">
        <div className="w-full h-full min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
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
