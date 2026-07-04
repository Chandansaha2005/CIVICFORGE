import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { SolutionFeed } from './pages/citizen/SolutionFeed';
import { DeveloperDashboard } from './pages/developer/DeveloperDashboard';
import { ProblemFeed } from './pages/developer/ProblemFeed';
import { DeveloperLeaderboard } from './pages/developer/DeveloperLeaderboard';
import { MPDashboard } from './pages/mp/MPDashboard';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-900" id="app-root-container">
          <Navbar />
          
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Citizen Only Routes */}
              <Route 
                path="/citizen/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feed/solutions" 
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'developer']}>
                    <SolutionFeed />
                  </ProtectedRoute>
                } 
              />

              {/* Developer Only Routes */}
              <Route 
                path="/developer/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['developer']}>
                    <DeveloperDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/feed/problems" 
                element={
                  <ProtectedRoute allowedRoles={['developer']}>
                    <ProblemFeed />
                  </ProtectedRoute>
                } 
              />

              {/* MP Evaluator Only Routes */}
              <Route 
                path="/mp/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['mp']}>
                    <MPDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Public/Shared Routes for Authenticated Users */}
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'developer', 'mp']}>
                    <DeveloperLeaderboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Catch All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notification Provider */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'text-xs font-bold text-slate-800 bg-white border border-slate-100 rounded-xl shadow-md p-4',
              duration: 4000,
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF'
                }
              }
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}
