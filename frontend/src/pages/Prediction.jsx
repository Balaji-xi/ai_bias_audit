import { useState } from 'react';
import axios from 'axios';
import { Activity, Play, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Prediction = () => {
  const { dataset, modelData, mitigatedMetrics } = useAppContext();
  const [formData, setFormData] = useState({});
  const [useMitigated, setUseMitigated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  if (!dataset || !modelData) {
    return <div className="p-8 text-slate-400">Please upload a dataset and train a model first.</div>;
  }

  const features = dataset.columns.filter(col => col !== dataset.target);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const res = await axios.post('http://localhost:8000/api/predict', {
        dataset_id: dataset.dataset_id || dataset.id,
        features: formData,
        use_mitigated: useMitigated
      });

      if (res.status === 200) {
        setPrediction(res.data.prediction);
      }
    } catch (err) {
      console.error(err);
      alert('Prediction failed. ' + (err.response?.data?.detail || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Model Inference</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* INPUT FORM */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h2 className="text-xl font-bold mb-6">Input Features</h2>
          <form onSubmit={handlePredict} className="space-y-4">
            
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
              <input 
                type="checkbox" 
                id="useMitigated"
                checked={useMitigated}
                onChange={(e) => setUseMitigated(e.target.checked)}
                disabled={!mitigatedMetrics}
                className="w-5 h-5 accent-emerald-500 rounded bg-slate-800 border-slate-600"
              />
              <label htmlFor="useMitigated" className="text-slate-300 font-medium">
                Use Reduced Bias Model
                {!mitigatedMetrics && <span className="text-xs text-rose-400 block">Mitigate bias first</span>}
              </label>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {features.map(feature => (
                <div key={feature}>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    {feature}
                  </label>
                  <input
                    type="text"
                    name={feature}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${feature}...`}
                    required
                  />
                </div>
              ))}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              {loading ? <Activity className="animate-spin" /> : <Play />}
              {loading ? 'Predicting...' : 'Predict Target'}
            </button>
          </form>
        </div>

        {/* RESULTS */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col justify-center items-center text-center">
          {prediction !== null ? (
            <div className="animate-fade-in-up">
              <CheckCircle className="text-emerald-500 w-20 h-20 mb-6 mx-auto" />
              <h3 className="text-slate-400 text-lg mb-2">Predicted {dataset.target}</h3>
              <div className="text-5xl font-black text-white bg-slate-900 px-8 py-6 rounded-2xl border border-slate-700 shadow-inner">
                {prediction}
              </div>
              <p className="text-sm text-slate-500 mt-6">
                Using {useMitigated ? 'Mitigated (Fair)' : 'Baseline'} Model
              </p>
            </div>
          ) : (
            <div className="text-slate-500">
              <Activity className="w-16 h-16 mb-4 mx-auto opacity-50" />
              <p>Enter features and click predict<br/>to see the result.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Prediction;
