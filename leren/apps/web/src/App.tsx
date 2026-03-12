import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

import Landing from '@/pages/Landing';
import Download from '@/pages/Download';
import Demo from '@/pages/Demo';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import LiveTutor from '@/pages/live/LiveTutor';
import Subjects from '@/pages/subjects/Subjects';
import SubjectDetail from '@/pages/subjects/SubjectDetail';
import Saved from '@/pages/saved/Saved';
import Progress from '@/pages/progress/Progress';
import ArchivePage from '@/pages/archive/ArchivePage';
import Profile from '@/pages/profile/Profile';
import Settings from '@/pages/settings/Settings';
import Teacher from '@/pages/teacher/Teacher';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/download" element={<Download />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app shell */}
        <Route
          path="/app"
          element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="/app/live" replace />} />
          <Route path="live" element={<LiveTutor />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="subjects/:id" element={<SubjectDetail />} />
          <Route path="saved" element={<Saved />} />
          <Route path="progress" element={<Progress />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="teacher" element={<Teacher />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
