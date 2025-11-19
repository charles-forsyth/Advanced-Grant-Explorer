
import React, { useEffect, useCallback } from 'react';
import { Grant } from '../types';

interface GrantModalProps {
    grant: Grant | null;
    onClose: () => void;
}

const CloseIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

export const GrantModal: React.FC<GrantModalProps> = ({ grant, onClose }) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (grant) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [grant, handleKeyDown]);

    if (!grant) {
        return null;
    }

    const sourceColor = grant.source === 'Government' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const statusColor = grant.status === 'Upcoming' ? 'text-green-600' : 'text-red-600';

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fade-in-scale 0.3s forwards' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>
                <div className="p-8">
                    <div className="mb-6">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sourceColor}`}>
                            {grant.source === 'Government' ? '🏛️' : '🏢'} {grant.source}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{grant.name}</h2>
                        <p className="text-lg text-gray-500">{grant.agency}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-t border-b border-gray-200 py-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Award Amount</p>
                            <p className="text-xl font-bold text-blue-600">{grant.award_text}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Proposal Timing</p>
                            <p className="text-lg font-semibold text-gray-800">{grant.proposal_timing}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className={`text-lg font-bold ${statusColor}`}>{grant.status}</p>
                        </div>
                    </div>

                    {grant.solicitationUrl && (
                        <div className="mb-8 text-center">
                            <a
                                href={grant.solicitationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                View Official Solicitation
                            </a>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">Purpose</h4>
                            <p className="text-gray-700 leading-relaxed">{grant.purpose}</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">Strategic Relevance</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {grant.relevance.map((r, index) => <li key={index}>{r}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};
