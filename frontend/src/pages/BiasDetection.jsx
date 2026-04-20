import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Search, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BiasDetection = () => {
  const { dataset, modelData, setBiasMetrics, biasMetrics, setDataset } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedSensitives, setSelectedSensitives] = useState([]);

  const handleDetect = async () => {
    if (selectedSensitives.length === 0) return;
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:8000/api/detect-bias', {
        dataset_id: dataset.id,
        target_col: dataset.target,
        sensitive_cols: selectedSensitives
      });
      setBiasMetrics(res.data);
      setDataset(prev => ({ ...prev, sensitiveAttrs: selectedSensitives }));
    } catch (err) {
      console.error(err);
      alert('Bias detection failed. Did you train the model?');
    } finally {
      setLoading(false);
    }
  };

  const toggleSensitive = (col) => {
    setSelectedSensitives(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  if (!dataset || !modelData) {
    return <div className="p-8 text-slate-400">Please upload data and train a model first.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bias Detection</h1>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
        <h2 className="text-xl font-bold mb-4">Select Sensitive Attributes</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {dataset.columns.filter(c => c !== dataset.target).map(col => (
            <button
              key={col}
              onClick={() => toggleSensitive(col)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedSensitives.includes(col) 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
        <button 
          onClick={handleDetect}
          disabled={loading || selectedSensitives.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
        >
          {loading ? <Search className="animate-spin" /> : <AlertTriangle />}
          Detect Bias
        </button>
      </div>

      {biasMetrics && Object.entries(biasMetrics).map(([attr, metrics]) => (
        <div key={attr} className={`bg-slate-800 rounded-xl p-8 border ${metrics.is_biased ? 'border-rose-500' : 'border-slate-700'} mb-8`}>
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold capitalize">Attribute: {attr}</h2>
              {metrics.is_biased ? (
                <div className="bg-rose-500/20 text-rose-400 px-4 py-1 rounded-full text-sm font-bold border border-rose-500/50 flex items-center gap-2">
                  <AlertTriangle size={16} /> Bias Detected
                </div>
              ) : (
                <div className="bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full text-sm font-bold border border-emerald-500/50">
                  Fairness Achieved
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <MetricCard title="Demographic Parity Difference" value={metrics.demographic_parity_difference} threshold={0.1} />
             <MetricCard title="Equalized Odds Difference" value={metrics.equalized_odds_difference} threshold={0.1} />
           </div>

           <h3 className="text-lg font-bold mb-4">Selection Rate by Group</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap bg-slate-900 rounded-lg overflow-hidden">
               <thead className="bg-slate-950 text-slate-400">
                 <tr>
                   <th className="p-4 rounded-tl-lg">Group</th>
                   <th className="p-4 rounded-tr-lg">Selection Rate (True Positives)</th>
                 </tr>
               </thead>
               <tbody>
                 {Object.entries(metrics.groups).map(([groupName, groupMetrics]) => (
                   <tr key={groupName} className="border-t border-slate-800">
                     <td className="p-4 font-medium">{groupName}</td>
                     <td className="p-4">{(groupMetrics.selection_rate * 100).toFixed(1)}%</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      ))}
    </div>
  );
};

const MetricCard = ({ title, value, threshold }) => {
  const isViolated = value > threshold;
  return (
    <div className={`p-6 rounded-xl border ${isViolated ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-900 border-slate-700'}`}>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="group relative">
          <Info size={14} className="text-slate-500 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-xs rounded border border-slate-700 z-10">
            Absolute difference in metric between demographic groups. Values closer to 0 indicate fairness.
          </div>
        </div>
      </div>
      <div className={`text-3xl font-black ${isViolated ? 'text-rose-400' : 'text-emerald-400'}`}>
        {value.toFixed(3)}
      </div>
    </div>
  );
};

export default BiasDetection;
