
import React, { useState } from 'react';

interface AddGoalModalProps {
    onClose: () => void;
    onAddGoal: (goal: string) => void;
    isAdding: boolean;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onAddGoal, isAdding }) => {
    const [goal, setGoal] = useState('');

    const handleSubmit = () => {
        if (goal.trim() && !isAdding) {
            onAddGoal(goal.trim());
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Grant Goal</h2>
                <p className="text-gray-600 mb-6">Describe a new strategic goal to find relevant funding opportunities. For example, "Develop a curriculum for data science education."</p>

                <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="Enter your new goal here..."
                    aria-label="New grant goal"
                    disabled={isAdding}
                />

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                        disabled={isAdding}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400"
                        disabled={!goal.trim() || isAdding}
                    >
                        {isAdding ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </>
                        ) : 'Find Grants'}
                    </button>
                </div>
            </div>
        </div>
    );
};
