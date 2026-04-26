import { useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Search, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const BiasDetection = () => {
  const { dataset, modelData, setBiasMetrics, biasMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedSensitives, setSelectedSensitives] = useState([]);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoRisks, setAutoRisks] = useState(null);

  // -----------------------------
  // MANUAL DETECT
  // -----------------------------
  const handleDetect = async () => {
    if (selectedSensitives.length === 0) return;
    setLoading(true);

    try {
      console.log("Manual Detect:", {
        dataset_id: dataset.dataset_id,
        target_col: dataset.target,
        sensitive_cols: selectedSensitives
      });

      const res = await axios.post('http://localhost:8000/api/detect-bias', {
        dataset_id: dataset.dataset_id,
        target_col: dataset.target,
        sensitive_cols: selectedSensitives
      });

      console.log("Detect Response:", res.data);
      setBiasMetrics(res.data.bias_results);

    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      alert('Bias detection failed. Did you train the model?');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // AUTO DETECT
  // -----------------------------
  const handleAutoDetect = async () => {
    setAutoDetecting(true);

    try {
      console.log("Auto Detect:", {
        dataset_id: dataset.dataset_id,
        target_col: dataset.target
      });

      const res = await axios.post('http://localhost:8000/api/auto-detect-bias', {
        dataset_id: dataset.dataset_id,
        target_col: dataset.target
      });
      console.log("AUTO REQUEST:", {
        dataset_id: dataset?.dataset_id,
        target_col: dataset?.target
      });
      console.log("Auto Detect Response:", res.data);

      const risks = res.data.detected_risks || [];
      setAutoRisks(risks);

      // Auto-select top biased attributes
      const topRisks = risks
        .filter(r => r.is_biased)
        .map(r => r.attribute);

      if (topRisks.length > 0) {
        setSelectedSensitives(topRisks);
      } else if (risks.length > 0) {
        setSelectedSensitives([risks[0].attribute]);
      }

    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      alert('Auto-detect failed. Did you train the model?');
    } finally {
      setAutoDetecting(false);
    }
  };

  // -----------------------------
  // TOGGLE ATTRIBUTE
  // -----------------------------
  const toggleSensitive = (col) => {
    setSelectedSensitives(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    );
  };

  if (!dataset || !modelData) {
    return <div className="p-8 text-slate-400">Please upload data and train a model first.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bias Detection</h1>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">

        {/* AUTO DETECT */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-700 pb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Auto-Detect Bias</h2>
            <p className="text-sm text-slate-400">
              Automatically scan the dataset to find the most biased attributes.
            </p>
          </div>

          <button
            onClick={handleAutoDetect}
            disabled={autoDetecting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            {autoDetecting ? <Search className="animate-spin" /> : <Search />}
            Auto-Detect Risks
          </button>
        </div>

        {/* AUTO RESULTS */}
        {autoRisks && (
          <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold mb-4">Detected Risks Ranked</h3>

            {autoRisks.length === 0 && (
              <p className="text-slate-400">No categorical columns found.</p>
            )}

            {autoRisks.map((risk, idx) => (
              <div key={risk.attribute} className="flex justify-between p-3 bg-slate-800 rounded mb-2">
                <div className="flex gap-3">
                  <span>{idx + 1}.</span>
                  <span className="font-bold">{risk.attribute}</span>
                </div>
                <div>
                  {risk.max_disparity.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELECT ATTRIBUTES */}
        <h2 className="text-xl font-bold mb-4">Select Sensitive Attributes</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          {dataset.columns.filter(c => c !== dataset.target).map(col => (
            <button
              key={col}
              onClick={() => toggleSensitive(col)}
              className={`px-4 py-2 rounded ${selectedSensitives.includes(col)
                ? 'bg-indigo-600'
                : 'bg-slate-900'
                }`}
            >
              {col}
            </button>
          ))}
        </div>

        <button
          onClick={handleDetect}
          disabled={loading || selectedSensitives.length === 0}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex gap-2"
        >
          {loading ? <Search className="animate-spin" /> : <AlertTriangle />}
          Detect Bias
        </button>
      </div>

      {/* RESULTS */}
      {biasMetrics && Object.entries(biasMetrics).map(([attr, metrics]) => (
        <div key={attr} className="bg-slate-800 p-6 mb-6 rounded">
          <h2 className="text-xl font-bold mb-2">{attr}</h2>
          <p>DPD: {metrics.demographic_parity_difference.toFixed(3)}</p>
          <p>EOD: {metrics.equalized_odds_difference.toFixed(3)}</p>
        </div>
      ))}
    </div>
  );
};

export default BiasDetection;