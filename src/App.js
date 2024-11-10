import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Campaign_table from './Pages/Campaign_table';
import SalesAgents from './Pages/SaleAgents';
import TeamLeader from './Pages/TeamLeader';
import Teams_table from './Pages/Teams_table';
import Manager from './Pages/Manager';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import OpsManagerTable from './Pages/OpsManagerTable';
import SeniorOpsManagerTable from './Pages/SeniorOpsManagerTable';
import HeadofSales from './Pages/HeadofSales';
import Admins_Management from './Pages/Admins_Management';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import HierarchicalTree from './Pages/HR';
import HOD from './Pages/HOD';
import JDH from './Pages/JDH';

function App() {
  return (
    // <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />


        <Route path="/Dashboard" element={ <Dashboard />} />

        <Route path="/campaign" element={<Campaign_table />} />
        <Route path="/teams" element={<Teams_table />} />
        <Route path="/team-leaders" element={<TeamLeader />} />
        <Route path="/sales-agents" element={<SalesAgents />} />
        <Route path="/ops_manager" element={<OpsManagerTable />} />
        <Route path="/senior_ops_manager" element={<SeniorOpsManagerTable />} />
        <Route path="/heads_of_sales" element={<HeadofSales />} />
        <Route path="/admin_management" element={<Admins_Management />} />


        <Route path="/head_of_departments" element={<HOD/>} />
        <Route path="/junior_department_heads" element={<JDH/>} />


      </Routes>
    </Router>
    // </AuthProvider>
  );
}

export default App;