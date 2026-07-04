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
      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
        vouched
          ? 'bg-[#FFFDF9] shadow-[inset_2px_2px_5px_rgba(16,185,129,0.15),inset_-2px_-2px_5px_#FFFFFF] text-emerald-600 border border-emerald-500/20'
          : 'bg-[#FFFDF9] text-[#9A8C7F] shadow-[2px_2px_5px_rgba(142,130,114,0.1),-2px_-2px_5px_#FFFFFF] hover:shadow-[inset_2px_2px_5px_rgba(142,130,114,0.1),inset_-2px_-2px_5px_#FFFFFF] border border-white/40 hover:text-[#3F6C51]'
      } disabled:opacity-80`}
      id={`vouch-btn-${solutionId}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3F6C51]" />
      ) : (
        <ThumbsUp className={`w-3.5 h-3.5 ${vouched ? 'fill-emerald-500 text-emerald-600' : 'text-[#9A8C7F]'}`} />
      )}
      <span>{vouchCount} {vouchCount === 1 ? 'Vouch' : 'Vouches'}</span>
    </button>
  );
};

