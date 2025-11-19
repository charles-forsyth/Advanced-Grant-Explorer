
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StrategySummary } from '../types';

interface StrategySummaryModalProps {
    isSynthesizing: boolean;
    summaryData: StrategySummary | null;
    onClose: () => void;
    savedGrantsCount: number;
}

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-xl font-semibold text-gray-800">Synthesizing Strategy</h3>
        <p className="text-gray-600 mt-2">The AI is analyzing your grant portfolio to generate strategic insights. This may take a moment.</p>
    </div>
);

const ErrorState: React.FC = () => (
     <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Synthesis Failed</h3>
        <p className="text-gray-600 mt-2">There was an error generating the strategy summary. Please try again later.</p>
    </div>
);


export const StrategySummaryModal: React.FC<StrategySummaryModalProps> = ({ isSynthesizing, summaryData, onClose, savedGrantsCount }) => {
    
    const handleExportPdf = () => {
        const input = document.getElementById('strategy-summary-pdf-content');
        if (!input) return;

        const pdfHeader = input.querySelector('#pdf-header-controls');
        pdfHeader?.classList.add('hidden');

        html2canvas(input, { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight
        }).then(canvas => {
            pdfHeader?.classList.remove('hidden');

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.width / canvas.height;
            
            let imgWidth = pdfWidth - 20;
            let imgHeight = imgWidth / canvasAspectRatio;
            
            if (imgHeight > pdfHeight - 20) {
                imgHeight = pdfHeight - 20;
                imgWidth = imgHeight * canvasAspectRatio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = 10;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`grant_strategy_summary.pdf`);
        }).catch(err => {
            console.error("Error generating PDF:", err);
            pdfHeader?.classList.remove('hidden');
        });
    };

    const renderContent = () => {
        if (isSynthesizing) return <LoadingState />;
        if (!summaryData) return <ErrorState />;
        
        const { overallStrategy, fundingOverview, keyDeadlines, thematicClusters, strategicAdvice, portfolioGoalAlignment, grantSpecificAnalysis } = summaryData;

        return (
            <>
                <div id="strategy-summary-pdf-content" className="p-8 overflow-y-auto bg-gray-50">
                    {/* Header */}
                    <div id="pdf-header-controls" className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Grant Portfolio Strategy Summary</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Overall Strategy */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Overall Strategy</h3>
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic">
                            {overallStrategy}
                        </blockquote>
                    </div>

                    {/* Funding Snapshot */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Funding Snapshot ({savedGrantsCount} Grants)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-gray-100 rounded-lg"><p className="text-sm text-gray-600">Total Potential</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(fundingOverview.totalMaxFunding)}</p></div>
                            <div className="p-4 bg-gray-100 rounded-lg"><p className="text-sm text-gray-600">Avg. Max Award</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(fundingOverview.averageMaxAward)}</p></div>
                            <div className="p-4 bg-gray-100 rounded-lg"><p className="text-sm text-gray-600">Government</p><p className="text-2xl font-bold text-blue-600">{fundingOverview.governmentGrantCount}</p></div>
                            <div className="p-4 bg-gray-100 rounded-lg"><p className="text-sm text-gray-600">Private</p><p className="text-2xl font-bold text-blue-600">{fundingOverview.privateGrantCount}</p></div>
                        </div>
                    </div>

                    {/* Deadlines & Clusters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Upcoming Deadlines</h3>
                            <ul className="space-y-3">
                                {keyDeadlines.length > 0 ? keyDeadlines.map((item, i) => (
                                    <li key={i} className="flex items-start"><span className="text-blue-500 mr-2 mt-1">▶</span><div><p className="font-semibold text-gray-700">{item.grantName}</p><p className="text-sm text-gray-500">{item.deadline}</p></div></li>
                                )) : <p className="text-gray-500">No upcoming deadlines identified.</p>}
                            </ul>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Thematic Clusters</h3>
                            <div className="space-y-4">
                                {thematicClusters.length > 0 ? thematicClusters.map((cluster, i) => (
                                    <div key={i}><p className="font-semibold text-gray-700">{cluster.theme}</p><p className="text-sm text-gray-500">{cluster.grantNames.join(', ')}</p></div>
                                )) : <p className="text-gray-500">No clusters identified.</p>}
                            </div>
                        </div>
                    </div>
                    
                    {/* Portfolio Goal Alignment */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Portfolio Goal Alignment</h3>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">{portfolioGoalAlignment}</p>
                    </div>

                    {/* Grant-Specific Analysis */}
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Grant-Specific Analysis</h3>
                        <div className="space-y-6">
                            {grantSpecificAnalysis.map((analysis, i) => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-bold text-lg text-gray-800">{analysis.grantName}</h4>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <p className="font-semibold text-sm text-gray-600 flex items-center gap-2">Proposal Approach:</p>
                                            <p className="text-gray-700 mt-1 pl-1">{analysis.proposalApproach}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-600 flex items-center gap-2">Solicitation Alignment:</p>
                                            <p className="text-gray-700 mt-1 pl-1">{analysis.solicitationAlignment}</p>
                                        </div>
                                        <div>
                                           <p className="font-semibold text-sm text-gray-600 flex items-center gap-2">Campus Interest Alignment:</p>
                                           <p className="text-gray-700 mt-1 pl-1">{analysis.campusInterestAlignment}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Strategic Advice */}
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Strategic Advice</h3>
                        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-2xl mt-1">💡</span>
                            <p className="text-green-800">{strategicAdvice}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                {!isSynthesizing && summaryData && (
                    <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200 flex justify-end items-center space-x-4">
                        <button onClick={handleExportPdf} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                            Export as PDF
                        </button>
                        <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Close</button>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {renderContent()}
            </div>
        </div>
    );
};
