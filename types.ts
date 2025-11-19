
export interface Grant {
    id: string;
    name: string;
    agency: string;
    source: 'Government' | 'Private';
    purpose: string;
    relevance: string[];
    award_min: number;
    award_max: number;
    award_text: string;
    proposal_timing: string;
    award_timing: string;
    status: 'Upcoming' | 'Past';
    solicitationUrl?: string;
}

export interface Filters {
    relevance: string;
    source: string;
    award: string;
    status: string;
}

export type View = 'explorer' | 'analysis' | 'timeline' | 'management';

export interface GrantSpecificAnalysis {
    grantName: string;
    proposalApproach: string;
    solicitationAlignment: string;
    campusInterestAlignment: string;
}

export interface StrategySummary {
    overallStrategy: string;
    fundingOverview: {
        totalMaxFunding: number;
        averageMaxAward: number;
        governmentGrantCount: number;
        privateGrantCount: number;
    };
    keyDeadlines: {
        grantName: string;
        deadline: string;
    }[];
    thematicClusters: {
        theme: string;
        grantNames: string[];
    }[];
    strategicAdvice: string;
    portfolioGoalAlignment: string;
    grantSpecificAnalysis: GrantSpecificAnalysis[];
}
