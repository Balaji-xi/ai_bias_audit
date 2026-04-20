import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react';

const Comparison = () => {
  const { modelData, mitigatedMetrics, biasMetrics } = useAppContext();

  if (!mitigatedMetrics) {
    return <div className="p-8 text-slate-400">Please apply mitigation to see the comparison.</div>;
  }

  const baselineAcc = modelData.accuracy * 100;
  const newAcc = mitigatedMetrics.accuracy * 100;
  const accDiff = newAcc - baselineAcc;

  // Grab the first sensitive attribute
  const sensitiveCol = Object.keys(biasMetrics)[0];
  const oldDPD = biasMetrics[sensitiveCol].demographic_parity_difference;
  const newDPD = mitigatedMetrics.biasMetrics[sensitiveCol].demographic_parity_difference;
  const dpdDiff = newDPD - oldDPD; // Expect negative (improvement)

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Before vs After Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
           <h2 className="text-xl font-bold mb-6 text-emerald-400 flex items-center gap-2"><TrendingDown /> Fairness Improvement</h2>
           <div className="flex items-end gap-4">
             <div>
               <p className="text-sm text-slate-400 mb-1">Baseline DPD</p>
               <p className="text-3xl font-bold line-through text-rose-400/50">{oldDPD.toFixed(3)}</p>
             </div>
             <ArrowLeftRight className="text-slate-500 mb-2" />
             <div>
               <p className="text-sm text-slate-400 mb-1">Mitigated DPD</p>
               <p className="text-4xl font-black text-emerald-400">{newDPD.toFixed(3)}</p>
             </div>
           </div>
           <p className="mt-4 text-emerald-400/80 font-medium bg-emerald-500/10 px-4 py-2 rounded">
             Disparity reduced by {Math.abs(dpdDiff).toFixed(3)}!
           </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
           <h2 className="text-xl font-bold mb-6 text-rose-400 flex items-center gap-2"><TrendingUp /> Accuracy Trade-off</h2>
           <div className="flex items-end gap-4">
             <div>
               <p className="text-sm text-slate-400 mb-1">Baseline Accuracy</p>
               <p className="text-3xl font-bold text-slate-300">{baselineAcc.toFixed(1)}%</p>
             </div>
             <ArrowLeftRight className="text-slate-500 mb-2" />
             <div>
               <p className="text-sm text-slate-400 mb-1">Mitigated Accuracy</p>
               <p className="text-4xl font-black text-rose-400">{newAcc.toFixed(1)}%</p>
             </div>
           </div>
           <p className="mt-4 text-rose-400/80 font-medium bg-rose-500/10 px-4 py-2 rounded">
             Accuracy changed by {accDiff.toFixed(1)}%
           </p>
        </div>
      </div>

    </div>
  );
};

export default Comparison;
