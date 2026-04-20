import { Link } from 'react-router-dom';
import { ArrowRight, Shield, BarChart3, Fingerprint } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto">
      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
        <Shield size={40} className="text-white" />
      </div>
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 drop-shadow-sm">
        Ensure Fairness in Your AI Systems
      </h1>
      <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
        Detect, measure, visualize, and mitigate bias in machine learning datasets and models.
        Build trust, align with regulations, and deploy AI ethically.
      </p>
      
      <div className="flex gap-4">
        <Link 
          to="/upload" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
        >
          Start Audit <ArrowRight size={20} />
        </Link>
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-full font-semibold transition-all"
        >
          View Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
        <FeatureCard 
          icon={<Fingerprint className="text-emerald-400" size={32}/>}
          title="Detect Hidden Bias"
          desc="Upload your datasets or predictions to automatically scan for discriminatory patterns across protected groups."
        />
        <FeatureCard 
          icon={<BarChart3 className="text-blue-400" size={32}/>}
          title="Measure & Visualize"
          desc="Use industry-leading metrics from Fairlearn. Visualize disparities with interactive, intuitive charts."
        />
        <FeatureCard 
          icon={<Shield className="text-indigo-400" size={32}/>}
          title="Apply Mitigation"
          desc="Apply debiasing algorithms like Reweighting and Exponentiated Gradient directly to your model training loop."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 flex flex-col items-center text-center hover:bg-slate-800 transition-colors">
    <div className="mb-4 bg-slate-900 p-4 rounded-full shadow-inner">{icon}</div>
    <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
    <p className="text-slate-400">{desc}</p>
  </div>
);

export default Landing;
