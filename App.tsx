import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { grantData as initialGrantData, initialRelevanceMap } from './constants';
import { Grant, Filters, View } from './types';
import { GrantModal } from './components/GrantModal';
import { FundingAnalysisChart } from './components/FundingAnalysisChart';
import { AddGoalModal } from './components/AddGoalModal';
import { ManageGrantsView } from './components/ManageGrantsView';
import { TimelineView } from './components/TimelineView';
import { PriorityGrantModal } from './components/PriorityGrantModal';
import { parseCsv } from './utils/csvParser';
import { deepResearchGrant, findGrantsForGoal, findPriorityGrant } from './services/geminiService';

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000)}k`;
    return `$${value}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Header: React.FC<{ onFindPriority: () => void; isFindingPriority: boolean; hasSavedGrants: boolean }> = ({ onFindPriority, isFindingPriority, hasSavedGrants }) => (
    <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Advanced Grant Explorer</h1>
                <p className="mt-2 text-lg text-gray-600">An AI-powered dashboard for strategic funding discovery.</p>
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={onFindPriority}
                    disabled={isFindingPriority || !hasSavedGrants}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    title={!hasSavedGrants ? "Save grants to find your priority" : "Find my priority grant"}
                >
                    {isFindingPriority ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    )}
                    {isFindingPriority ? 'Analyzing...' : 'Show Priority Grant'}
                </button>
            </div>
        </div>
    </header>
);

interface NavigationProps {
    currentView: View;
    onNavClick: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavClick }) => (
    <nav className="bg-white rounded-lg shadow-sm p-2 mb-8 sticky top-4 z-40">
        <ul className="flex justify-center space-x-1 md:space-x-4">
            <li><button onClick={() => onNavClick('explorer')} className={`nav-btn px-3 py-2 rounded-md transition-colors duration-200 ${currentView === 'explorer' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>🔍 Grant Explorer</button></li>
            <li><button onClick={() => onNavClick('analysis')} className={`nav-btn px-3 py-2 rounded-md transition-colors duration-200 ${currentView === 'analysis' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>📊 Funding Analysis</button></li>
            <li><button onClick={() => onNavClick('timeline')} className={`nav-btn px-3 py-2 rounded-md transition-colors duration-200 ${currentView === 'timeline' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>🗓️ Proposal Timeline</button></li>
            <li><button onClick={() => onNavClick('management')} className={`nav-btn px-3 py-2 rounded-md transition-colors duration-200 ${currentView === 'management' ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>🗂️ Manage Grants</button></li>
        </ul>
    </nav>
);

interface GrantCardProps {
    grant: Grant;
    isSaved: boolean;
    onSelect: (id: string) => void;
    onToggleSave: (id: string) => void;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant, isSaved, onSelect, onToggleSave }) => {
    const sourceColor = grant.source === 'Government' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    const statusColor = grant.status === 'Upcoming' ? 'text-green-600' : 'text-red-600';

    const handleToggleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSave(grant.id);
    };

    return (
        <div onClick={() => onSelect(grant.id)} className="bg-white rounded-lg shadow-md p-6 cursor-pointer flex flex-col justify-between transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-xl relative">
            <button
                onClick={handleToggleSave}
                className={`absolute top-4 right-4 text-gray-400 hover:text-yellow-400 transition-colors z-10 ${isSaved ? 'text-yellow-400' : ''}`}
                aria-label={isSaved ? 'Unsave grant' : 'Save grant'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sourceColor}`}>{grant.source === 'Government' ? '🏛️' : '🏢'} {grant.source}</span>
                    <span className={`text-xs font-bold mr-8 ${statusColor}`}>{grant.status}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{grant.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{grant.agency}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{grant.purpose}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">Award:</span>
                    <span className="font-mono text-blue-600 font-bold">{grant.award_max > 0 ? `${formatCurrency(grant.award_min)} - ${formatCurrency(grant.award_max)}` : 'In-kind'}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="font-semibold text-gray-800">Next Deadline:</span>
                    <span className="font-semibold text-gray-700">{grant.proposal_timing}</span>
                </div>
            </div>
        </div>
    );
};

interface FilterControlsProps {
    filters: Filters;
    relevanceOptions: { [key: string]: string };
    onFilterChange: (filter: keyof Filters, value: string) => void;
    onDeepResearch: () => void;
    onAddNewGoal: () => void;
    isResearching: boolean;
    onUploadClick: () => void;
    useRag: boolean;
    onUseRagChange: (checked: boolean) => void;
    uploadedFileName: string | null;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, relevanceOptions, onFilterChange, onDeepResearch, onAddNewGoal, isResearching, onUploadClick, useRag, onUseRagChange, uploadedFileName }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label htmlFor="relevance-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Goal</label>
                <select id="relevance-filter" value={filters.relevance} onChange={(e) => onFilterChange('relevance', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Goals</option>
                    {Object.entries(relevanceOptions).map(([key, value]) => (
                        <option key={key} value={key}>{(value as string).length > 30 ? (value as string).substring(0,27)+'...' : (value as string)}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Source</label>
                <select id="source-filter" value={filters.source} onChange={(e) => onFilterChange('source', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Sources</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                </select>
            </div>
            <div>
                <label htmlFor="award-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Award Size</label>
                <select id="award-filter" value={filters.award} onChange={(e) => onFilterChange('award', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Award Sizes</option>
                    <option value="under-500k">Under $500k</option>
                    <option value="500k-2m">$500k - $2M</option>
                    <option value="over-2m">Over $2M</option>
                </select>
            </div>
            <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select id="status-filter" value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Statuses</option>
                    <option value="Upcoming">Upcoming Deadline</option>
                    <option value="Past">Past Deadline</option>
                </select>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button onClick={onDeepResearch} disabled={isResearching} className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                {isResearching ? (
                   <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.166l-1.581 1.581A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a5.002 5.002 0 008.09 3.472l1.58 1.58A7.002 7.002 0 013.102 15H5v2.101a1 1 0 01-1.992.09l-.008-.09V15a1 1 0 011-1h4a1 1 0 010 2H5.001a5.002 5.002 0 00-1-1.057z" clipRule="evenodd" />
                    </svg>
                )}
                {isResearching ? 'Deep Research & Refresh' : 'Deep Research & Refresh'}
            </button>
            <button onClick={onAddNewGoal} disabled={isResearching} className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Goal
            </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200">
            <button onClick={onUploadClick} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-1.5z"/>
                  <path d="M9 13h2v5H9v-5z"/>
                </svg>
                Upload grants.gov CSV
            </button>
            <div className="flex items-center gap-2">
                 <input
                    type="checkbox"
                    id="use-rag-checkbox"
                    checked={useRag}
                    onChange={(e) => onUseRagChange(e.target.checked)}
                    disabled={!uploadedFileName}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="use-rag-checkbox" className={`text-sm font-medium ${uploadedFileName ? 'text-gray-700' : 'text-gray-400'}`}>
                    Enable RAG from CSV
                </label>
            </div>
            <span className="text-sm text-gray-500 truncate">{uploadedFileName || 'No file uploaded.'}</span>
        </div>
    </div>
);

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('explorer');
    
    const [grants, setGrants] = useState<Grant[]>(() => {
        try {
            const savedGrants = localStorage.getItem('grants_data');
            return savedGrants ? JSON.parse(savedGrants) : initialGrantData;
        } catch (error) {
            console.error("Error parsing grants from localStorage", error);
            return initialGrantData;
        }
    });

    const [relevanceOptions, setRelevanceOptions] = useState<{ [key: string]: string }>(() => {
        try {
            const savedOptions = localStorage.getItem('relevance_options_data');
            return savedOptions ? JSON.parse(savedOptions) : initialRelevanceMap;
        } catch (error) {
            console.error("Error parsing relevance options from localStorage", error);
            return initialRelevanceMap;
        }
    });

    const [savedGrantIds, setSavedGrantIds] = useState<string[]>(() => {
        try {
            const savedIds = localStorage.getItem('saved_grants_data');
            return savedIds ? JSON.parse(savedIds) : [];
        } catch (error) {
            console.error("Error parsing saved grant IDs from localStorage", error);
            return [];
        }
    });
    
    const [filters, setFilters] = useState<Filters>({ relevance: 'all', source: 'all', award: 'all', status: 'all' });
    const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
    const [isResearching, setIsResearching] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [isAddGoalModalOpen, setAddGoalModalOpen] = useState(false);
    
    const [parsedCsvData, setParsedCsvData] = useState<Record<string, string>[] | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [useRag, setUseRag] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
    const [isFindingPriority, setIsFindingPriority] = useState(false);
    const [priorityGrantResult, setPriorityGrantResult] = useState<{ grant: Grant; rationale: string; nextSteps: string; } | null>(null);


    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('grants_data', JSON.stringify(grants));
            localStorage.setItem('relevance_options_data', JSON.stringify(relevanceOptions));
            localStorage.setItem('saved_grants_data', JSON.stringify(savedGrantIds));
        } catch (error) {
            console.error("Error saving data to localStorage", error);
        }
    }, [grants, relevanceOptions, savedGrantIds]);


    const handleFilterChange = (filter: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [filter]: value }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setParsedCsvData(parseCsv(content));
            setUploadedFileName(file.name);
            setUseRag(true); // Automatically enable RAG on new upload
        };
        reader.readAsText(file);
    };

    const getAwardRange = (key: string) => {
        switch(key) {
            case 'under-500k': return {min: 0, max: 499999};
            case '500k-2m': return {min: 500000, max: 2000000};
            case 'over-2m': return {min: 2000001, max: Infinity};
            default: return null;
        }
    };

    const filteredGrants = useMemo(() => {
        return grants.filter(grant => {
            if (filters.relevance !== 'all' && !grant.relevance.includes(relevanceOptions[filters.relevance])) return false;
            if (filters.source !== 'all' && grant.source !== filters.source) return false;
            if (filters.status !== 'all' && grant.status !== filters.status) return false;
            if (filters.award !== 'all') {
                const range = getAwardRange(filters.award);
                if (range) {
                    return grant.award_max > 0 && grant.award_max >= range.min && grant.award_max <= range.max;
                }
            }
            return true;
        });
    }, [filters, grants, relevanceOptions]);
    
    const savedGrants = useMemo(() => {
        return grants.filter(grant => savedGrantIds.includes(grant.id));
    }, [grants, savedGrantIds]);

    const handleDeepResearch = useCallback(async () => {
        setIsResearching(true);
        const grantsToResearch = [...filteredGrants];
        
        for (const grant of grantsToResearch) {
            try {
                let ragContent: string | null = null;
                if (useRag && parsedCsvData) {
                     const grantNameLower = grant.name.toLowerCase();
                    const relevantRows = parsedCsvData.filter(row => {
                        const title = (row['Opportunity Title'] || '').toLowerCase();
                        const number = (row['Opportunity Number'] || '').toLowerCase();
                        return title.includes(grantNameLower) || (number && grantNameLower.includes(number));
                    });

                    if (relevantRows.length > 0) {
                        const header = Object.keys(relevantRows[0]).join(',');
                        const rowsAsCsv = relevantRows.map(row => Object.values(row).join(',')).join('\n');
                        ragContent = `Relevant Data from CSV:\n${header}\n${rowsAsCsv}`;
                    }
                }
                
                const updatedGrant = await deepResearchGrant(grant, ragContent);
                setGrants(currentGrants => {
                    const index = currentGrants.findIndex(g => g.id === grant.id);
                    if (index !== -1) {
                         const newGrants = [...currentGrants];
                         newGrants[index] = updatedGrant;
                         return newGrants;
                    }
                    return currentGrants;
                });
                
                await sleep(1000); // Prevent rate limiting
            } catch (error) {
                 console.error(`Failed to research grant ${grant.name}:`, error);
                 // Optionally add user-facing error message here
            }
        }
        setIsResearching(false);
    }, [filteredGrants, useRag, parsedCsvData]);


    const handleAddNewGoal = useCallback(async (goal: string) => {
        setIsAddingGoal(true);
        let ragContent: string | null = null;

        if (useRag && parsedCsvData && parsedCsvData.length > 0) {
            const goalKeywords = goal.toLowerCase().split(/\s+/).filter(k => k.length > 2);
            const relevantRows = parsedCsvData.filter(row => {
                const searchableText = `${row['Opportunity Title'] || ''} ${row['Description'] || ''}`.toLowerCase();
                return goalKeywords.some(keyword => searchableText.includes(keyword));
            }).slice(0, 10);

            if (relevantRows.length > 0) {
                const header = Object.keys(relevantRows[0]).join(',');
                const rowsAsCsv = relevantRows.map(row => Object.values(row).join(',')).join('\n');
                ragContent = `Search within this Relevant Data from CSV:\n${header}\n${rowsAsCsv}`;
            }
        }

        const newGrants = await findGrantsForGoal(goal, grants, ragContent);

        setAddGoalModalOpen(false);

        if (newGrants.length > 0) {
            const newKey = goal.toLowerCase().replace(/\s+/g, '-').slice(0, 20);
            setRelevanceOptions(prev => ({ ...prev, [newKey]: goal }));
            setGrants(prev => [...prev, ...newGrants]);
        }
        setIsAddingGoal(false);
    }, [grants, useRag, parsedCsvData]);
    

    const handleSelectGrant = useCallback((id: string) => {
        const grant = grants.find(g => g.id === id) || null;
        setSelectedGrant(grant);
    }, [grants]);

    const handleToggleSaveGrant = useCallback((grantId: string) => {
        setSavedGrantIds(prev =>
            prev.includes(grantId)
                ? prev.filter(id => id !== grantId)
                : [...prev, grantId]
        );
    }, []);

    const handleFindPriorityGrant = async () => {
        if (savedGrants.length === 0) {
            alert("Please save one or more grants to use this feature.");
            return;
        }
        
        setIsFindingPriority(true);
        setPriorityGrantResult(null);
        setIsPriorityModalOpen(true);

        try {
            const { grantId, rationale, nextSteps } = await findPriorityGrant(savedGrants);
            const priorityGrant = grants.find(g => g.id === grantId);
            
            if (priorityGrant) {
                setPriorityGrantResult({ grant: priorityGrant, rationale, nextSteps });
            } else {
                console.error("Gemini returned a non-existent grant ID:", grantId);
                setIsPriorityModalOpen(false);
                alert("An error occurred while identifying the priority grant.");
            }
        } catch (error) {
            console.error("Error finding priority grant:", error);
            setIsPriorityModalOpen(false);
            alert("Failed to get priority grant from AI. Please try again.");
        } finally {
            setIsFindingPriority(false);
        }
    };
    
    const handleCreateGrant = (newGrant: Grant) => {
        setGrants(prev => [...prev, newGrant]);
        setSavedGrantIds(prev => [...prev, newGrant.id]);
    };

    const handleUpdateGrant = (updatedGrant: Grant) => {
        setGrants(prev => prev.map(g => g.id === updatedGrant.id ? updatedGrant : g));
    };

    const handleDeleteGrant = (grantId: string) => {
        setGrants(prev => prev.filter(g => g.id !== grantId));
        setSavedGrantIds(prev => prev.filter(id => id !== grantId));
    };

    const renderContent = () => {
        switch(currentView) {
            case 'explorer':
                return (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p className="text-gray-700 mb-4">This dashboard helps you navigate the complex landscape of cyberinfrastructure funding. Use the AI-powered tools to refresh grant data or discover new opportunities based on your goals.</p>
                            <FilterControls 
                                filters={filters} 
                                relevanceOptions={relevanceOptions}
                                onFilterChange={handleFilterChange} 
                                onDeepResearch={handleDeepResearch}
                                onAddNewGoal={() => setAddGoalModalOpen(true)}
                                isResearching={isResearching}
                                onUploadClick={() => fileInputRef.current?.click()}
                                useRag={useRag}
                                onUseRagChange={setUseRag}
                                uploadedFileName={uploadedFileName}
                            />
                        </div>
                        <div className="relative min-h-[200px]">
                            {isResearching && (
                                <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center rounded-lg">
                                    <div className="text-center">
                                         <svg className="animate-spin mx-auto h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2 text-gray-600 font-medium">Updating grant details...</p>
                                    </div>
                                </div>
                            )}
                            
                            {filteredGrants.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredGrants.map(grant => (
                                        <GrantCard 
                                            key={grant.id} 
                                            grant={grant} 
                                            isSaved={savedGrantIds.includes(grant.id)}
                                            onSelect={handleSelectGrant}
                                            onToggleSave={handleToggleSaveGrant}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                    <p className="text-xl text-gray-500">No grants found matching your criteria.</p>
                                    <p className="text-sm text-gray-400 mt-2">Try adjusting filters or adding a new goal.</p>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'analysis':
                return <FundingAnalysisChart grants={filteredGrants} />;
            case 'timeline':
                return <TimelineView grants={filteredGrants} onSelectGrant={handleSelectGrant} />;
            case 'management':
                return (
                    <ManageGrantsView 
                        savedGrants={savedGrants}
                        onUpdateGrant={handleUpdateGrant}
                        onDeleteGrant={handleDeleteGrant}
                        onCreateGrant={handleCreateGrant}
                        onUnsaveGrant={handleToggleSaveGrant}
                        onSelectGrant={handleSelectGrant}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <Header 
                    onFindPriority={handleFindPriorityGrant}
                    isFindingPriority={isFindingPriority}
                    hasSavedGrants={savedGrantIds.length > 0}
                />
                <Navigation currentView={currentView} onNavClick={setCurrentView} />
                <main>
                    {renderContent()}
                </main>
            </div>

            <GrantModal 
                grant={selectedGrant} 
                onClose={() => setSelectedGrant(null)} 
            />

            {isAddGoalModalOpen && (
                <AddGoalModal 
                    onClose={() => setAddGoalModalOpen(false)} 
                    onAddGoal={handleAddNewGoal}
                    isAdding={isAddingGoal}
                />
            )}

            <PriorityGrantModal
                isOpen={isPriorityModalOpen}
                onClose={() => setIsPriorityModalOpen(false)}
                result={priorityGrantResult}
                onViewDetails={() => {
                    setIsPriorityModalOpen(false);
                    if (priorityGrantResult?.grant) {
                        handleSelectGrant(priorityGrantResult.grant.id);
                    }
                }}
            />
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".csv" 
            />
        </div>
    );
};

export default App;