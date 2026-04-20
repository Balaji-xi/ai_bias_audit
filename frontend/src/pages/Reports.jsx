import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Reports = () => {
  const { dataset, biasMetrics, mitigatedMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    // A real implementation would post current session context to API,
    // which generates the PDF and returns it as a blob. 
    // Here we use a stylized UI placeholder.
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        alert('Report downloaded successfully (Simulation)');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Executive Report</h1>
      
      <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 flex flex-col items-center text-center">
        <FileText size={64} className="text-blue-500 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Complete Audit Report</h2>
        <p className="text-slate-400 max-w-lg mb-8">
          Download a comprehensive PDF report summarizing the dataset profile, baseline bias metrics, 
          mitigation steps performed, and the final fairness vs accuracy trade-offs. 
          Ready for compliance and stakeholder review.
        </p>

        <button 
          onClick={handleDownload}
          disabled={loading || !dataset}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 flex justify-center items-center gap-3 text-lg"
        >
          {loading ? <Download className="animate-bounce" /> : <Download />}
          {loading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>

        {!dataset && (
          <p className="mt-4 text-rose-400 font-medium">You must complete an audit before downloading a report.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
