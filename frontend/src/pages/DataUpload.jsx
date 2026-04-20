import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const DataUpload = () => {
  const { setDataset } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/api/upload-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDataset({
        id: res.data.dataset_id,
        filename: file.name,
        columns: res.data.columns,
        rows: res.data.total_rows,
        target: '',
        sensitiveAttrs: []
      });
      setPreview(res.data.preview);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Data Upload</h1>
      
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
        <form onSubmit={handleUpload} className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
          <UploadCloud size={48} className="text-blue-500 mb-4" />
          <p className="text-lg mb-2 font-medium">Drag & drop your dataset here</p>
          <p className="text-slate-400 mb-6 text-sm">Supports CSV files</p>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            id="file-upload" 
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Files
          </label>
          
          {file && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400">
              <CheckCircle size={20} />
              <span>{file.name} ready</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!file || loading}
            className="mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : null}
            {loading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        </form>
      </div>

      {preview && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 overflow-x-auto shadow-lg">
          <h2 className="text-xl font-bold mb-4">Data Preview</h2>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                {Object.keys(preview[0]).map((col) => (
                  <th key={col} className="p-3 font-semibold border-b border-slate-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="hover:bg-slate-700/50 border-b border-slate-700/50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-3 text-slate-400">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataUpload;
