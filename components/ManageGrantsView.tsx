
import React, { useState } from 'react';
import { Grant, StrategySummary } from '../types';
import { GrantFormModal } from './GrantFormModal';
import { ManagedGrantDetailModal } from './ManagedGrantDetailModal';
import { FundingAnalysisChart } from './FundingAnalysisChart';
import { TimelineView } from './TimelineView';
import { StrategySummaryModal } from './StrategySummaryModal';
import { synthesizeGrantStrategy } from '../services/geminiService';


interface ManageGrantsViewProps {
    savedGrants: Grant[];
    onUpdateGrant: (grant: Grant) => void;
    onDeleteGrant: (grantId: string) => void;
    onCreateGrant: (grant: Grant) => void;
    onUnsaveGrant: (grantId: string) => void;
    onSelectGrant: (grantId: string) => void;
}

type SubView = 'list' | 'analysis' | 'timeline';

export const ManageGrantsView: React.FC<ManageGrantsViewProps> = ({
    savedGrants,
    onUpdateGrant,
    onDeleteGrant,
    onCreateGrant,
    onUnsaveGrant,
    onSelectGrant
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGrant, setEditingGrant] = useState<Grant | null>(null);
    const [viewingGrant, setViewingGrant] = useState<Grant | null>(null);
    const [subView, setSubView] = useState<SubView>('list');
    const [summaryData, setSummaryData] = useState<StrategySummary | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const handleCreate = () => {
        setEditingGrant(null);
        setIsFormOpen(true);
    };

    const handleEdit = (grant: Grant) => {
        setViewingGrant(null); // Close detail modal
        setEditingGrant(grant);
        setIsFormOpen(true);
    };
    
    const handleDelete = (grantId: string) => {
        onDeleteGrant(grantId);
        setViewingGrant(null);
    };

    const handleUnsave = (grantId: string) => {
        onUnsaveGrant(grantId);
        setViewingGrant(null);
    };

    const handleSave = (grant: Grant) => {
        if (editingGrant) {
            onUpdateGrant(grant);
        } else {
            onCreateGrant(grant);
        }
        setIsFormOpen(false);
        setEditingGrant(null);
    };
    
    const handleViewDetails = (grantId: string) => {
        const grant = savedGrants.find(g => g.id === grantId);
        if (grant) {
            setViewingGrant(grant);
        }
    };

    const handleGenerateSummary = async () => {
        if (savedGrants.length === 0) return;
        setIsSummaryModalOpen(true);
        setIsSynthesizing(true);
        setSummaryData(null);
        try {
            const result = await synthesizeGrantStrategy(savedGrants);
            setSummaryData(result);
        } catch (error) {
            console.error("Failed to synthesize grant strategy:", error);
            setSummaryData(null); // Ensure it's null on error
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleCloseSummaryModal = () => {
        setIsSummaryModalOpen(false);
        setSummaryData(null);
        setIsSynthesizing(false);
    };

    const renderSubView = () => {
        switch (subView) {
            case 'analysis':
                return <FundingAnalysisChart grants={savedGrants} />;
            case 'timeline':
                return <TimelineView grants={savedGrants} onSelectGrant={onSelectGrant} />;
            case 'list':
            default:
                return savedGrants.length > 0 ? (
                    <div className="space-y-4">
                        {savedGrants.map(grant => (
                            <div 
                                key={grant.id} 
                                className="p-4 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleViewDetails(grant.id)}
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{grant.name}</p>
                                    <p className="text-sm text-gray-500">{grant.agency}</p>
                                </div>
                                 <div className="text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                       <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-12">
                        <p className="text-xl text-gray-500">You have no saved grants.</p>
                        <p className="text-sm text-gray-400 mt-2">Click the star icon on a grant in the explorer to save it.</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Saved Grants</h2>
                <div className="flex items-center flex-wrap gap-2">
                     <div className="bg-gray-100 rounded-lg p-1 flex space-x-1">
                        <button onClick={() => setSubView('list')} className={`px-3 py-1 text-sm font-medium rounded-md ${subView === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Saved List</button>
                        <button onClick={() => setSubView('analysis')} className={`px-3 py-1 text-sm font-medium rounded-md ${subView === 'analysis' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Analysis</button>
                        <button onClick={() => setSubView('timeline')} className={`px-3 py-1 text-sm font-medium rounded-md ${subView === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Timeline</button>
                    </div>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={savedGrants.length === 0 || isSynthesizing}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSynthesizing ? (
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.5a.75.75 0 01.75.75v.255l.403.403a.75.75 0 010 1.06l-.403.404v1.078a.75.75 0 01-1.5 0v-1.078l-.403-.404a.75.75 0 010-1.06l.403-.403V3.25A.75.75 0 0110 2.5zM15.5 6.25a.75.75 0 00-.75-.75h-1.078l-.404-.403a.75.75 0 00-1.06 0l-.404.403H9.25a.75.75 0 000 1.5h2.536l.404.403a.75.75 0 001.06 0l.404-.403h1.078a.75.75 0 00.75-.75zM8.25 10a.75.75 0 01.75-.75h.255l.403-.404a.75.75 0 011.06 0l.404.403h1.078a.75.75 0 010 1.5h-1.078l-.404.403a.75.75 0 01-1.06 0l-.404-.403H9a.75.75 0 01-.75-.75zM4.5 13.75a.75.75 0 00.75.75h1.078l.404.403a.75.75 0 001.06 0l.404-.403h2.536a.75.75 0 000-1.5H8.214l-.404-.403a.75.75 0 00-1.06 0l-.404.403H5.25a.75.75 0 00-.75.75z" /></svg>
                        )}
                        {isSynthesizing ? 'Analyzing...' : 'Synthesize Strategy'}
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Create
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {renderSubView()}
            </div>
            
            {isSummaryModalOpen && (
                 <StrategySummaryModal
                    isSynthesizing={isSynthesizing}
                    summaryData={summaryData}
                    onClose={handleCloseSummaryModal}
                    savedGrantsCount={savedGrants.length}
                />
            )}

            {viewingGrant && (
                <ManagedGrantDetailModal
                    grant={viewingGrant}
                    onClose={() => setViewingGrant(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUnsave={handleUnsave}
                />
            )}

            {isFormOpen && (
                <GrantFormModal
                    grantToEdit={editingGrant}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};