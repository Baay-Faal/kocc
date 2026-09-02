import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import MarkAttendance from './pages/MarkAttendance';
import CourseDocuments from './pages/CourseDocuments';
import LmdBulletin from './pages/LmdBulletin';
import MbeneTutor from './pages/MbeneTutor';
import AlertsView from './pages/AlertsView';
import AdminManagement from './pages/AdminManagement';
import Evaluations from './pages/Evaluations';
import Grades from './pages/Grades';
import Directory from './pages/Directory';

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes Sécurisées */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/timetable" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Timetable />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <DashboardLayout>
                <MarkAttendance />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'student', 'admin']}>
              <DashboardLayout>
                <CourseDocuments />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bulletin" 
          element={
            <ProtectedRoute allowedRoles={['student', 'admin', 'direction']}>
              <DashboardLayout>
                <LmdBulletin />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tutor" 
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <DashboardLayout>
                <MbeneTutor />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute allowedRoles={['direction', 'responsable', 'admin']}>
              <DashboardLayout>
                <AlertsView />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/management" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'direction']}>
              <DashboardLayout>
                <AdminManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/directory" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'direction', 'teacher']}>
              <DashboardLayout>
                <Directory />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/evaluations" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <DashboardLayout>
                <Evaluations />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grades" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <DashboardLayout>
                <Grades />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
