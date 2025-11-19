
import React, { useState, useEffect } from 'react';
import { Grant } from '../types';

interface GrantFormModalProps {
    grantToEdit: Grant | null;
    onClose: () => void;
    onSave: (grant: Grant) => void;
}

const initialFormState: Omit<Grant, 'id'> = {
    name: '',
    agency: '',
    source: 'Government',
    purpose: '',
    relevance: [],
    award_min: 0,
    award_max: 0,
    award_text: '',
    proposal_timing: '',
    award_timing: '',
    status: 'Upcoming',
    solicitationUrl: '',
};

export const GrantFormModal: React.FC<GrantFormModalProps> = ({ grantToEdit, onClose, onSave }) => {
    const [formState, setFormState] = useState<Grant | Omit<Grant, 'id'>>(grantToEdit || initialFormState);

    useEffect(() => {
        setFormState(grantToEdit || initialFormState);
    }, [grantToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    }
    
    const handleRelevanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        setFormState(prev => ({...prev, relevance: value.split('\n')}));
    }

    const handleSubmit = () => {
        const finalGrant: Grant = 'id' in formState
            ? formState
            : { ...formState, id: `custom_${Date.now()}` };
        
        onSave(finalGrant);
    };

    const title = grantToEdit ? "Edit Grant" : "Create New Grant";

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                    <div className="space-y-4">
                        <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Grant Name" className="w-full p-2 border rounded" />
                        <input type="text" name="agency" value={formState.agency} onChange={handleChange} placeholder="Agency" className="w-full p-2 border rounded" />
                        <textarea name="purpose" value={formState.purpose} onChange={handleChange} placeholder="Purpose" className="w-full p-2 border rounded" rows={3}></textarea>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <select name="source" value={formState.source} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Government">Government</option>
                                <option value="Private">Private</option>
                            </select>
                            <select name="status" value={formState.status} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Upcoming">Upcoming</option>
                                <option value="Past">Past</option>
                            </select>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input type="number" name="award_min" value={formState.award_min} onChange={handleNumberChange} placeholder="Min Award" className="w-full p-2 border rounded" />
                             <input type="number" name="award_max" value={formState.award_max} onChange={handleNumberChange} placeholder="Max Award" className="w-full p-2 border rounded" />
                        </div>
                        <input type="text" name="award_text" value={formState.award_text} onChange={handleChange} placeholder="Award Text (e.g., '$100k - $500k')" className="w-full p-2 border rounded" />
                        <input type="text" name="proposal_timing" value={formState.proposal_timing} onChange={handleChange} placeholder="Proposal Timing" className="w-full p-2 border rounded" />
                        <input type="text" name="award_timing" value={formState.award_timing} onChange={handleChange} placeholder="Award Timing" className="w-full p-2 border rounded" />
                        <input type="text" name="solicitationUrl" value={formState.solicitationUrl} onChange={handleChange} placeholder="Solicitation URL" className="w-full p-2 border rounded" />
                        <textarea name="relevance" value={formState.relevance.join('\n')} onChange={handleRelevanceChange} placeholder="Relevance Goals (one per line)" className="w-full p-2 border rounded" rows={3}></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Grant</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
