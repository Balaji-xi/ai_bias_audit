import { useState } from 'react';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Reports = () => {
  const { dataset, modelData, biasMetrics, mitigatedMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/generate-report', {
        dataset: dataset || {},
        modelData: modelData || {},
        biasMetrics: biasMetrics || {},
        mitigatedMetrics: mitigatedMetrics || {}
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FairLens_Audit_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
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
