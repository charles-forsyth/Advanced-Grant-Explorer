
import React, { useMemo } from 'react';
import { Grant } from '../types';

interface TimelineViewProps {
    grants: Grant[];
    onSelectGrant: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ grants, onSelectGrant }) => {
    const upcomingGrants = useMemo(() => {
        return grants
            .filter(grant => grant.status === 'Upcoming' && grant.proposal_timing.match(/\d{4}/))
            .map(grant => {
                let date: Date | null = null;
                try {
                    const cleanedDateStr = grant.proposal_timing
                        .replace(/(upcoming\)?|preliminary proposal:?|full proposal:?|by invitation:?|FY \d{4}|;.*)/gi, '')
                        .trim();
                    const dateMatch = cleanedDateStr.match(/(\w+\s\d{1,2},\s\d{4})/);
                    if (dateMatch) {
                        date = new Date(dateMatch[0]);
                    }
                    if (!date || isNaN(date.getTime())) {
                       const simpleDate = new Date(cleanedDateStr);
                       if(!isNaN(simpleDate.getTime())) date = simpleDate;
                       else return null;
                    }
                } catch (e) { return null; }
                return { ...grant, date };
            })
            .filter((grant): grant is Grant & { date: Date } => grant !== null && grant.date instanceof Date && !isNaN(grant.date.getTime()))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [grants]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <p className="text-gray-700">Stay ahead of deadlines with this chronological timeline of upcoming grant proposals. Each entry represents a key submission date, allowing you to prioritize your efforts and plan your application strategy effectively.</p>
            </div>
            {upcomingGrants.length > 0 ? (
                upcomingGrants.map((grant, index) => (
                    <div key={grant.id} className="flex items-start" onClick={() => onSelectGrant(grant.id)}>
                        <div className="flex flex-col items-center mr-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-white">{index + 1}</div>
                            {index < upcomingGrants.length - 1 && <div className="w-px h-full bg-gray-300 mt-2"></div>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md flex-1 cursor-pointer transition-shadow hover:shadow-lg">
                            <p className="font-bold text-lg text-blue-600">{grant.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <h4 className="font-semibold text-gray-800">{grant.name}</h4>
                            <p className="text-sm text-gray-600">{grant.proposal_timing}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-xl text-gray-500">No upcoming grants with specific deadlines found.</p>
                </div>
            )}
        </div>
    );
};
