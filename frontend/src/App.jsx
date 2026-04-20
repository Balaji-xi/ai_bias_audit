import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DataUpload from './pages/DataUpload';
import ModelTraining from './pages/ModelTraining';
import BiasDetection from './pages/BiasDetection';
import Visualization from './pages/Visualization';
import BiasMitigation from './pages/BiasMitigation';
import Comparison from './pages/Comparison';
import Reports from './pages/Reports';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/train" element={<ModelTraining />} />
            <Route path="/detect" element={<BiasDetection />} />
            <Route path="/visualize" element={<Visualization />} />
            <Route path="/mitigate" element={<BiasMitigation />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
