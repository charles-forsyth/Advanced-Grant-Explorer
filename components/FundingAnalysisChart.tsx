
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Grant } from '../types';

const formatCurrency = (value: number) => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${Math.round(value / 1000)}k`;
    }
    return `$${value}`;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 rounded-md shadow-lg">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-blue-600">{`Max Award: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

export const FundingAnalysisChart: React.FC<{grants: Grant[]}> = ({ grants }) => {
    const chartData = useMemo(() => {
        return grants
            .filter(g => g.award_max > 0)
            .sort((a, b) => a.award_max - b.award_max)
            .map(g => ({
                name: g.name.length > 45 ? g.name.substring(0, 42) + '...' : g.name,
                fullName: g.name,
                award_max: g.award_max,
                source: g.source,
            }));
    }, [grants]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Maximum Grant Award Potential</h2>
            <div className="w-full h-[600px] md:h-[800px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 5,
                            right: 30,
                            left: 150,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={formatCurrency}
                            stroke="#6b7280"
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={150}
                            tick={{ fontSize: 12, fill: '#4b5563' }}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                        <Legend
                          formatter={(value, entry) => <span className="text-gray-700">{value}</span>}
                        />
                        <Bar dataKey="award_max" name="Max Award (USD)" fill="#3b82f6" >
                            {chartData.map((entry, index) => (
                                <Bar key={`cell-${index}`} fill={entry.source === 'Government' ? '#3b82f6' : '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};