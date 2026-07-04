import React, { useState } from 'react';
import { VouchButton } from './VouchButton';
import { ExternalLink, Code } from 'lucide-react';

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
        return 'bg-[#FAF6ED] text-emerald-600 border border-emerald-500/25 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.1)]';
      case 'matched':
        return 'bg-[#FAF6ED] text-[#3F6C51] border border-[#3F6C51]/25 shadow-[inset_1px_1px_3px_rgba(63,108,81,0.1)]';
      case 'under_review':
        return 'bg-[#FAF6ED] text-[#E76F51] border border-[#E76F51]/25 shadow-[inset_1px_1px_3px_rgba(231,111,81,0.1)]';
      default:
        return 'bg-[#FAF6ED] text-[#9A8C7F] border border-[#E5DEC9]/50';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className={`bg-[#FFFDF9] rounded-3xl p-5 shadow-[6px_6px_12px_0px_#E5DEC9,-6px_-6px_12px_0px_#FFFFFF] border border-white/40 space-y-4 transition-all hover:scale-[1.01] hover:bg-[#FAF6ED] cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-[#3F6C51] border-transparent shadow-[inset_2px_2px_5px_rgba(142,130,114,0.15)] bg-[#FAF6ED]' 
          : ''
      }`}
      id={`solution-card-${solution._id}`}
    >
      {/* Header and Category Tag */}
      <div className="flex justify-between items-start space-x-2">
        <div className="space-y-1 flex-1">
          <div className="inline-block">
            <span className="text-[9px] font-black uppercase tracking-wider bg-[#FAF6ED] text-[#9A8C7F] px-2.5 py-1 rounded-md border border-[#E5DEC9]/60 shadow-[inset_1px_1px_3px_rgba(142,130,114,0.08)]">
              {solution.targetCategory}
            </span>
          </div>
          <h4 className="text-base font-black text-[#3A2E2B] line-clamp-1 mt-1">{solution.title}</h4>
          <p className="text-[10px] font-bold text-[#9A8C7F]">
            By <span className="text-[#3F6C51] font-black">{solution.developer?.name || 'Seeded Developer'}</span>
          </p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getStatusColor(solution.status)}`}>
          {solution.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#9A8C7F] text-xs font-medium line-clamp-3 leading-relaxed">{solution.description}</p>

      {/* Tech Stack Badges */}
      {solution.techStack && solution.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {solution.techStack.map((tech) => (
            <span key={tech} className="bg-[#FAF6ED] text-[#9A8C7F] text-[9px] font-extrabold px-2 py-0.5 border border-white/40 shadow-[2px_2px_4px_rgba(142,130,114,0.06)] rounded-md">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="h-px bg-[#E5DEC9]/60 my-2"></div>

      {/* Footer and Interactive Buttons */}
      <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
        {/* Repo & Demo Links */}
        <div className="flex items-center space-x-3 text-xs font-bold text-[#9A8C7F]">
          {solution.repoUrl && (
            <a 
              href={solution.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#3F6C51] flex items-center space-x-1 hover:underline transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-[#3F6C51]" />
              <span>Repo</span>
            </a>
          )}
          {solution.demoUrl && (
            <a 
              href={solution.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#3F6C51] flex items-center space-x-1 hover:underline transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#3F6C51]" />
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

