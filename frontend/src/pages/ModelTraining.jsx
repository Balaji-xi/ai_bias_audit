import { useState } from 'react';
import axios from 'axios';
import { Play, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ModelTraining = () => {
  const { dataset, setModelData, setDataset } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(dataset?.target || '');
  const [modelType, setModelType] = useState('rf');
  const [results, setResults] = useState(null);

  const handleTrain = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!dataset || !target) return;

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/train-model', {
        dataset_id: dataset.dataset_id || dataset.id,
        target_col: target,
        model_type: modelType
      });

      console.log("🔥 RESPONSE:", res);
      if (res.status === 200) {
        setResults(res.data);
        setModelData(res.data);

        setDataset(prev => ({
          ...prev,
          target: target
        }));
      }

    } catch (err) {
      console.error("❌ ERROR:", err.response?.data || err.message);

      if (!results) {
        alert("Training failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!dataset) {
    return <div className="p-8 text-slate-400">Please upload a dataset first.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Model Training</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <form onSubmit={handleTrain} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Variable
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Target...</option>
                {dataset.columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Algorithm
              </label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="rf">Random Forest</option>
                <option value="lr">Logistic Regression</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Activity className="animate-spin" /> : <Play />}
              {loading ? 'Training...' : 'Train Baseline Model'}
            </button>

          </form>
        </div>

        {/* RESULTS */}
        {results && (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Results</h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-black text-emerald-400">
                {(results.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-slate-400">
                Baseline<br />Accuracy
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Confusion Matrix
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
                {results.confusion_matrix.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="bg-slate-900 p-3 rounded border border-slate-700"
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModelTraining;