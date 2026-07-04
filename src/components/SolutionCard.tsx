import React, { useState } from 'react';
import { VouchButton } from './VouchButton';
import { ExternalLink, Code, FileText, CheckCircle2 } from 'lucide-react';

interface Solution {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  targetCategory: string;
  repoUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  vouchCount: number;
  status: string;
  developer?: { name: string };
  createdAt: string;
}

interface SolutionCardProps {
  solution: Solution;
  userRole?: string;
  onVouched?: (id: string, newCount: number) => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ 
  solution, 
  userRole, 
  onVouched,
  onSelect,
  isSelected
}) => {
  const [vouchCount, setVouchCount] = useState(solution.vouchCount);

  const handleVouchedLocal = (newCount: number) => {
    setVouchCount(newCount);
    if (onVouched) onVouched(solution._id, newCount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      case 'matched':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30';
      case 'under_review':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      default:
        return 'bg-slate-950 text-slate-400 border-slate-800';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-4 transition-all hover:scale-[1.01] hover:border-slate-700 cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-teal-500 border-transparent bg-teal-950/20' 
          : 'border-slate-800 hover:shadow-slate-950/50'
      }`}
      id={`solution-card-${solution._id}`}
    >
      {/* Header and Category Tag */}
      <div className="flex justify-between items-start space-x-2">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-slate-950 text-slate-400 px-2.5 py-0.5 border border-slate-800 rounded">
            {solution.targetCategory}
          </span>
          <h4 className="text-base font-bold text-slate-100 line-clamp-1">{solution.title}</h4>
          <p className="text-[11px] font-semibold text-slate-400">
            By <span className="text-teal-400 font-bold">{solution.developer?.name || 'Seeded Developer'}</span>
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusColor(solution.status)}`}>
          {solution.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">{solution.description}</p>

      {/* Tech Stack Badges */}
      {solution.techStack && solution.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {solution.techStack.map((tech) => (
            <span key={tech} className="bg-slate-950 text-slate-400 text-[10px] font-semibold px-2 py-0.5 border border-slate-800 rounded">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="h-px bg-slate-800 my-2"></div>

      {/* Footer and Interactive Buttons */}
      <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
        {/* Repo & Demo Links */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-400">
          {solution.repoUrl && (
            <a 
              href={solution.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-teal-400 flex items-center space-x-1 hover:underline"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Repo</span>
            </a>
          )}
          {solution.demoUrl && (
            <a 
              href={solution.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-teal-400 flex items-center space-x-1 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Demo</span>
            </a>
          )}
        </div>

        {/* Vouch Button */}
        <VouchButton 
          solutionId={solution._id} 
          initialVouchCount={vouchCount} 
          onVouched={handleVouchedLocal}
          userRole={userRole}
        />
      </div>
    </div>
  );
};
