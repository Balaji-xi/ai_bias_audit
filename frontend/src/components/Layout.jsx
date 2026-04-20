import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Upload, Activity, AlertTriangle, BarChart2, ShieldCheck, GitPullRequest, FileText } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/dashboard', icon: Activity, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Data Upload' },
    { to: '/train', icon: GitPullRequest, label: 'Model Training' },
    { to: '/detect', icon: AlertTriangle, label: 'Bias Detection' },
    { to: '/visualize', icon: BarChart2, label: 'Visualization' },
    { to: '/mitigate', icon: ShieldCheck, label: 'Bias Mitigation' },
    { to: '/compare', icon: Shield, label: 'Comparison' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-700 fixed left-0 top-0 text-slate-300 flex flex-col">
      <div className="p-6 text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700">
        <Shield className="text-blue-500" />
        AI Bias Audit
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-6 py-3 hover:bg-slate-800 hover:text-white transition-colors ${
                isActive ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' : ''
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
