import { useAppContext } from '../context/AppContext';
import { Activity, Database, AlertCircle, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { dataset, biasMetrics, mitigatedMetrics } = useAppContext();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Dataset Loaded" value={dataset ? "Yes" : "No"} icon={Database} highlight={dataset ? 'emerald' : 'slate'}/>
        <StatCard title="Total Rows" value={dataset?.rows || "0"} icon={Activity} />
        <StatCard title="Bias Detected" value={biasMetrics ? "Yes" : "Pending"} icon={AlertCircle} highlight={biasMetrics ? 'rose' : 'slate'} />
        <StatCard title="Mitigation Applied" value={mitigatedMetrics ? "Yes" : "No"} icon={ShieldCheck} highlight={mitigatedMetrics ? 'emerald' : 'slate'} />
      </div>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Quick Insights</h2>
        {dataset ? (
          <ul className="list-disc pl-5 text-slate-300 space-y-2">
            <li>Target Column: <span className="text-blue-400 font-mono">{dataset.target}</span></li>
            <li>Sensitive Attributes: <span className="text-blue-400 font-mono">{dataset.sensitiveAttrs?.join(', ')}</span></li>
          </ul>
        ) : (
          <p className="text-slate-400">Please upload a dataset to view insights.</p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, highlight = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    slate: 'text-slate-400'
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex items-center gap-4">
      <div className={`p-3 bg-slate-900 rounded-lg ${colorMap[highlight]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
