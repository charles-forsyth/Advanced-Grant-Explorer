
import React from 'react';
import { Grant } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ManagedGrantDetailModalProps {
    grant: Grant;
    onClose: () => void;
    onEdit: (grant: Grant) => void;
    onDelete: (grantId: string) => void;
    onUnsave: (grantId: string) => void;
}

const CloseIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

export const ManagedGrantDetailModal: React.FC<ManagedGrantDetailModalProps> = ({ grant, onClose, onEdit, onDelete, onUnsave }) => {
    
    const handleExportPdf = () => {
        const input = document.getElementById('pdf-content');
        if (!input) return;
        
        const closeButton = input.querySelector('[aria-label="Close modal"]');
        closeButton?.classList.add('hidden');

        html2canvas(input, { 
            scale: 2,
            useCORS: true, 
            logging: false,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            closeButton?.classList.remove('hidden');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            
            let imgWidth = pdfWidth - 20; // 10mm margin on each side
            let imgHeight = imgWidth / canvasAspectRatio;
            
            if (imgHeight > pdfHeight - 20) { // check if it exceeds page height with margin
                imgHeight = pdfHeight - 20; // 10mm margin top/bottom
                imgWidth = imgHeight * canvasAspectRatio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = 10;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`grant_details_${grant.id}.pdf`);
        }).catch(err => {
            console.error("Error generating PDF:", err);
            closeButton?.classList.remove('hidden');
        });
    };

    const sourceColor = grant.source === 'Government' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const statusColor = grant.status === 'Upcoming' ? 'text-green-600' : 'text-red-600';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div id="pdf-content" className="p-8 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${sourceColor}`}>
                                {grant.source === 'Government' ? '🏛️' : '🏢'} {grant.source}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{grant.name}</h2>
                            <p className="text-lg text-gray-500">{grant.agency}</p>
                        </div>
                         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Key Info Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-t border-b border-gray-200 py-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Award Amount</p>
                            <p className="text-xl font-bold text-blue-600">{grant.award_text || `${grant.award_min} - ${grant.award_max}`}</p>
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

                    {/* Solicitation Link */}
                    {grant.solicitationUrl && (
                        <div className="mb-8">
                             <p className="text-sm font-medium text-gray-500 mb-1">Solicitation URL</p>
                             <a href={grant.solicitationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{grant.solicitationUrl}</a>
                        </div>
                    )}

                    {/* Purpose & Relevance */}
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
                         <div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">Award Timing</h4>
                            <p className="text-gray-700 leading-relaxed">{grant.award_timing}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer with Actions */}
                <div className="flex-shrink-0 p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                     <button onClick={handleExportPdf} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                        Export as PDF
                    </button>
                    <div className="flex space-x-2">
                         <button onClick={() => onUnsave(grant.id)} className="px-3 py-2 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200">Unsave</button>
                        <button onClick={() => onEdit(grant)} className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Edit Grant</button>
                        <button onClick={() => onDelete(grant.id)} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">Delete Permanently</button>
                    </div>
                </div>
            </div>
        </div>
    );
};