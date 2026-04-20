import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const BiasMitigation = () => {
  const { dataset, biasMetrics, setMitigatedMetrics, modelData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMitigation = async () => {
    if (!dataset || !biasMetrics) return;
    
    // Choose the first sensitive attribute that was flagged
    const sensitiveCol = Object.keys(biasMetrics)[0];
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/mitigate-bias', {
        dataset_id: dataset.id,
        target_col: dataset.target,
        sensitive_col: sensitiveCol,
        model_type: 'rf'
      });
      
      // Auto-re-detect bias to get new metrics
      const newBiasRes = await axios.post('http://localhost:8000/api/detect-bias', {
        dataset_id: dataset.id,
        target_col: dataset.target,
        sensitive_cols: Object.keys(biasMetrics)
      });

      setMitigatedMetrics({
        accuracy: res.data.accuracy,
        biasMetrics: newBiasRes.data
      });
      navigate('/compare');
    } catch (err) {
      console.error(err);
      alert('Mitigation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!biasMetrics) {
    return <div className="p-8 text-slate-400">Please run bias detection before applying mitigation.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bias Mitigation</h1>
      
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
        <h2 className="text-xl font-bold mb-4">Apply Fairlearn Reductions</h2>
        <p className="text-slate-400 mb-6">
          The baseline model yielded an accuracy of <strong className="text-white">{(modelData.accuracy * 100).toFixed(1)}%</strong>. 
          We have detected bias across your sensitive attributes. Applying the <strong>Exponentiated Gradient</strong> algorithm 
          with the <strong>Demographic Parity</strong> constraint will re-weight samples during training to enforce fairness.
        </p>

        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-emerald-400 mb-2">Algorithm: Exponentiated Gradient</h3>
          <p className="text-sm text-slate-300">
            A reductions approach that treats the fair classification problem as a sequence of cost-sensitive classification problems. 
            It guarantees specified fairness constraints while maintaining high accuracy.
          </p>
        </div>

        <button 
          onClick={handleMitigation}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 w-full flex justify-center items-center gap-3 text-lg"
        >
          {loading ? <Activity className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
          {loading ? 'Processing Mitigation...' : 'Apply Mitigation & Retrain'}
        </button>
      </div>
    </div>
  );
};

export default BiasMitigation;
