// apps/web/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';  // ← Ajouté
import QuizSetupPage from './pages/QuizSetupPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizResultsPage from './pages/QuizResultsPage';

function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0E1A', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>WI<span style={{ color: '#F5A623' }}>-</span>LO</h1>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link to="/login" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Login</Link>
        <Link to="/register" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Register</Link>
        <Link to="/onboarding" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Onboarding</Link>
        <Link to="/profile" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Profil</Link>
        <Link to="/admin/questions" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Admin Questions</Link>
        <Link to="/admin/categories" style={{ color: '#4A7AFF', textDecoration: 'none', padding: '8px 16px', border: '1px solid #4A7AFF', borderRadius: '8px' }}>Admin Catégories</Link>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/quiz" element={<QuizSetupPage />} />
          <Route path="/quiz/play" element={<QuizPlayPage />} />
          <Route path="/quiz/results" element={<QuizResultsPage />} />
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}