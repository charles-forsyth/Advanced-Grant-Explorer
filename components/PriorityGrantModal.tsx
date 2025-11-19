import React from 'react';
import { Grant } from '../types';

interface PriorityGrantModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: { grant: Grant; rationale: string; nextSteps: string; } | null;
    onViewDetails: () => void;
}

export const PriorityGrantModal: React.FC<PriorityGrantModalProps> = ({ isOpen, onClose, result, onViewDetails }) => {
    if (!isOpen || !result) return null;

    const { grant, rationale, nextSteps } = result;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Top Priority Identified</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-blue-900">{grant.name}</h3>
                    <p className="text-blue-700 text-sm mt-1">{grant.agency}</p>
                    <div className="flex gap-4 mt-3 text-sm text-blue-800 font-medium">
                        <span>💰 {grant.award_text}</span>
                        <span>🗓️ {grant.proposal_timing}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Why this is priority #1:</h4>
                        <p className="text-gray-700 leading-relaxed">{rationale}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Recommended Next Steps:</h4>
                        <p className="text-gray-700 leading-relaxed">{nextSteps}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">Close</button>
                    <button onClick={onViewDetails} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium shadow-sm">View Full Details</button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};