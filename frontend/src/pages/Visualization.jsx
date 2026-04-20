import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAppContext } from '../context/AppContext';

const Visualization = () => {
  const { biasMetrics } = useAppContext();

  if (!biasMetrics) {
    return <div className="p-8 text-slate-400">Please detect bias first to view visualizations.</div>;
  }

  // Assuming we plot the first sensitive attribute found for simplicity
  const sensitiveAttrs = Object.keys(biasMetrics);
  const selectedAttr = sensitiveAttrs[0];
  const data = biasMetrics[selectedAttr];
  
  const chartData = Object.entries(data.groups).map(([group, metrics]) => ({
    name: group,
    SelectionRate: parseFloat((metrics.selection_rate * 100).toFixed(1))
  }));

  const overallSelectionRate = parseFloat((data.overall.selection_rate * 100).toFixed(1));

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bias Visualization</h1>
      <p className="text-slate-400 mb-8">Visualizing selection rate for attribute: <strong className="text-white capitalize">{selectedAttr}</strong></p>

      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8 h-[500px]">
        <h2 className="text-xl font-bold mb-6">Selection Rate by Group (%)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Legend />
            <ReferenceLine y={overallSelectionRate} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: `Overall SR: ${overallSelectionRate}%`, fill: '#f59e0b' }} />
            <Bar dataKey="SelectionRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
         <h3 className="text-lg font-bold mb-2">Interpretation</h3>
         <p className="text-slate-400">
           The chart above displays the <strong>Selection Rate</strong> (True Positive Rate) for different groups of the <em>{selectedAttr}</em> attribute.
           The dashed orange line indicates the overall dataset's selection rate. Bars that significantly deviate from the dashed line indicate a higher likelihood of bias. 
           Demographic Parity expects these bars to be approximately equal across all groups.
         </p>
      </div>
    </div>
  );
};

export default Visualization;
