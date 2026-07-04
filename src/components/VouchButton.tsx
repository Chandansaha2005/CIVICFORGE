import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ThumbsUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VouchButtonProps {
  solutionId: string;
  initialVouchCount: number;
  onVouched: (updatedCount: number) => void;
  userRole?: string;
}

export const VouchButton: React.FC<VouchButtonProps> = ({ 
  solutionId, 
  initialVouchCount, 
  onVouched,
  userRole
}) => {
  const [loading, setLoading] = useState(false);
  const [vouched, setVouched] = useState(false);
  const [vouchCount, setVouchCount] = useState(initialVouchCount);

  const handleVouch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (userRole === 'mp') {
      toast.error('Evaluators/MPs are not permitted to register civic vouches.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post(`/api/solutions/${solutionId}/vouch`, {
        comment: 'Verified prototype and vouched!'
      });
      if (response.data.success) {
        const newCount = response.data.solution.vouchCount;
        setVouchCount(newCount);
        setVouched(true);
        onVouched(newCount);
        toast.success('Your civic vouch has been successfully registered!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register vouch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVouch}
      disabled={loading || vouched}
      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all cursor-pointer ${
        vouched
          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
          : 'bg-slate-950 hover:bg-teal-950/40 text-slate-400 hover:text-teal-400 border-slate-850 hover:border-teal-900/30'
      } disabled:opacity-80`}
      id={`vouch-btn-${solutionId}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
      ) : (
        <ThumbsUp className={`w-3.5 h-3.5 ${vouched ? 'fill-emerald-500 text-emerald-600' : ''}`} />
      )}
      <span>{vouchCount} {vouchCount === 1 ? 'Vouch' : 'Vouches'}</span>
    </button>
  );
};
