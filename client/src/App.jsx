import { Navigate, Route, Routes } from 'react-router-dom';
import { InterviewProvider } from '@/context/InterviewContext';
import Landing from '@/pages/Landing';
import InterviewScreen from '@/pages/InterviewScreen';
import ReportScreen from '@/pages/ReportScreen';

export default function App() {
  return (
    <InterviewProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<InterviewScreen />} />
        <Route path="/report/:sessionId" element={<ReportScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </InterviewProvider>
  );
}
