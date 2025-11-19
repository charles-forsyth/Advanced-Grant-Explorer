import { GoogleGenAI, Type } from "@google/genai";
import type { Grant, StrategySummary } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const grantSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'Unique identifier for the grant.' },
        name: { type: Type.STRING, description: 'Official name of the grant program.' },
        agency: { type: Type.STRING, description: 'The funding agency or organization.' },
        source: { type: Type.STRING, enum: ['Government', 'Private'] },
        purpose: { type: Type.STRING, description: 'A brief description of the grant\'s purpose.' },
        relevance: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Strategic relevance goals.' },
        award_min: { type: Type.NUMBER, description: 'Minimum award amount in USD.' },
        award_max: { type: Type.NUMBER, description: 'Maximum award amount in USD.' },
        award_text: { type: Type.STRING, description: 'Textual description of the award amount.' },
        proposal_timing: { type: Type.STRING, description: 'Information on proposal deadlines.' },
        award_timing: { type: Type.STRING, description: 'Information on when awards are announced.' },
        status: { type: Type.STRING, enum: ['Upcoming', 'Past'] },
        solicitationUrl: { type: Type.STRING, description: 'The direct, valid, and working URL to the official grant solicitation page. Must be an empty string if not found.' },
    },
    required: ['id', 'name', 'agency', 'source', 'purpose', 'relevance', 'award_min', 'award_max', 'award_text', 'proposal_timing', 'award_timing', 'status']
};

const grantSpecificAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        grantName: { type: Type.STRING, description: 'The name of the grant being analyzed.' },
        proposalApproach: { type: Type.STRING, description: 'A brief, recommended approach for the grant proposal.' },
        solicitationAlignment: { type: Type.STRING, description: 'Analysis of how the proposed approach aligns with the grant solicitation\'s stated goals and purpose.' },
        campusInterestAlignment: { type: Type.STRING, description: 'How this grant aligns with general campus interests like research growth, student opportunities, or infrastructure enhancement, based on its purpose.' },
    },
    required: ['grantName', 'proposalApproach', 'solicitationAlignment', 'campusInterestAlignment']
};

const strategySchema = {
    type: Type.OBJECT,
    properties: {
        overallStrategy: { type: Type.STRING, description: 'A 2-3 sentence high-level summary of the portfolio\'s focus.' },
        fundingOverview: {
            type: Type.OBJECT,
            properties: {
                totalMaxFunding: { type: Type.NUMBER, description: 'The sum of all award_max values.' },
                averageMaxAward: { type: Type.NUMBER, description: 'The average of all award_max values.' },
                governmentGrantCount: { type: Type.NUMBER, description: 'The number of grants with source "Government".' },
                privateGrantCount: { type: Type.NUMBER, description: 'The number of grants with source "Private".' },
            },
            required: ['totalMaxFunding', 'averageMaxAward', 'governmentGrantCount', 'privateGrantCount']
        },
        keyDeadlines: {
            type: Type.ARRAY,
            description: 'Up to 3 of the most immediate upcoming deadlines from grants with "Upcoming" status.',
            items: {
                type: Type.OBJECT,
                properties: {
                    grantName: { type: Type.STRING },
                    deadline: { type: Type.STRING }
                },
                required: ['grantName', 'deadline']
            }
        },
        thematicClusters: {
            type: Type.ARRAY,
            description: '2-4 thematic clusters based on grant purpose, with associated grant names.',
            items: {
                type: Type.OBJECT,
                properties: {
                    theme: { type: Type.STRING, description: 'The name of the thematic cluster.' },
                    grantNames: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['theme', 'grantNames']
            }
        },
        strategicAdvice: { type: Type.STRING, description: 'One or two pieces of actionable advice based on the complete portfolio analysis.' },
        portfolioGoalAlignment: { type: Type.STRING, description: 'An analysis of how the grant portfolio, as a whole, aligns with the strategic goals listed in the grants\' relevance fields.' },
        grantSpecificAnalysis: {
            type: Type.ARRAY,
            description: 'A detailed analysis for each grant in the portfolio.',
            items: grantSpecificAnalysisSchema
        }
    },
    required: ['overallStrategy', 'fundingOverview', 'keyDeadlines', 'thematicClusters', 'strategicAdvice', 'portfolioGoalAlignment', 'grantSpecificAnalysis']
};

const priorityGrantSchema = {
    type: Type.OBJECT,
    properties: {
        grantId: { type: Type.STRING, description: "The 'id' of the selected priority grant." },
        rationale: { type: Type.STRING, description: "A compelling explanation of why this grant is the top priority." },
        nextSteps: { type: Type.STRING, description: "Immediate, concrete actionable steps to pursue this grant." }
    },
    required: ['grantId', 'rationale', 'nextSteps']
};


/**
 * Validates if a string is a valid HTTP/HTTPS URL.
 * @param urlString The string to validate.
 * @returns true if valid, false otherwise.
 */
const isValidUrl = (urlString: string): boolean => {
    if (!urlString) return false;
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

export async function deepResearchGrant(grant: Grant, ragContent: string | null): Promise<Grant> {
    const basePrompt = `
As an expert grant researcher, your task is to meticulously verify the details of a grant and, most critically, to find its official solicitation URL.

**CRITICAL INSTRUCTIONS FOR URL VALIDATION:**
1.  **Accuracy is Paramount:** The URL MUST lead directly to the specific grant's main page, solicitation document (e.g., a PDF or webpage), or official program announcement.
2.  **Content Verification:** Before you provide a URL, you must conceptually "visit" it to confirm its content. The page title, main heading, or document content should explicitly mention the grant's name (e.g., "${grant.name}") or its official identifier/number.
3.  **No Generic Links:** DO NOT provide links to:
    *   General agency homepages (e.g., 'nsf.gov').
    *   Lists of multiple grants or funding opportunities.
    *   News articles or press releases *about* the grant.
    *   Third-party databases.
    The link must be the primary, authoritative source from the funding agency itself.
4.  **Empty is Better than Wrong:** If, after a thorough search, you cannot find a URL that meets these strict criteria, you MUST return an empty string ("") for the 'solicitationUrl' field. A wrong URL is worse than no URL.

**TASK:**
Update the \`proposal_timing\` and \`status\` to be current, and find the \`solicitationUrl\` based on the rules above.
Return ONLY the updated JSON object. Do not change the 'id' or 'relevance' fields.

**Grant to Verify:**
Name: ${grant.name}
Agency: ${grant.agency}

**Original Grant Data (for context):**
${JSON.stringify(grant)}
`;

    const ragInstruction = ragContent 
        ? `**PRIORITY INSTRUCTION:** You have been provided with data from a CSV file. Use this data as your PRIMARY SOURCE to verify the grant details. If the necessary information is not available in the provided data, you may then proceed with a web search.\n\n**Provided CSV Data:**\n${ragContent}\n\n` 
        : '';
    
    const prompt = ragInstruction + basePrompt;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: grantSchema,
            },
        });
        const updatedGrant = JSON.parse(response.text);

        if (updatedGrant.solicitationUrl && !isValidUrl(updatedGrant.solicitationUrl)) {
            console.warn(`Gemini returned an invalid URL for grant '${grant.name}'. Clearing it. URL: ${updatedGrant.solicitationUrl}`);
            updatedGrant.solicitationUrl = '';
        }

        return { ...updatedGrant, id: grant.id, relevance: grant.relevance };
    } catch (error) {
        console.error(`Error researching grant ${grant.name}:`, error);
        return grant;
    }
}

export async function findGrantsForGoal(goal: string, existingGrants: Grant[], ragContent: string | null): Promise<Grant[]> {
    const existingGrantNames = existingGrants.map(g => g.name).join(', ');

    const basePrompt = `
You are an expert grant researcher. Your task is to find up to 3 new government or private grant opportunities that are highly relevant to the strategic goal: "${goal}".

For each new grant you find, you must provide its details in the specified JSON format.

**CRITICAL INSTRUCTIONS FOR URL VALIDATION:**
1.  **Accuracy is Paramount:** The 'solicitationUrl' for each grant MUST lead directly to its specific, official page, solicitation document, or program announcement from the funding agency.
2.  **Content Verification:** You must verify the content of each URL. The destination page must clearly be about the specific grant you are returning. Check the title and headings.
3.  **No Generic Links:** Do NOT provide links to general agency homepages, lists of grants, news articles, or third-party databases. Each link must be the primary, authoritative source.
4.  **Empty is Better than Wrong:** If you find a grant but cannot locate a direct, official URL for it, you MUST return an empty string ("") for its 'solicitationUrl' field.

**ADDITIONAL INSTRUCTIONS:**
*   The 'relevance' field for all new grants must be an array containing only this exact string: "${goal}".
*   Generate a unique, short, lowercase, snake_case 'id' for each new grant.
*   Do NOT include any grants from this list of existing ones: ${existingGrantNames}.

Return ONLY a JSON array of grant objects. If no new grants are found, return an empty array.
`;

    const ragPrompt = `
You are an expert grant researcher. Your task is to search ONLY within the provided CSV data to find up to 3 grant opportunities that are highly relevant to the strategic goal: "${goal}".

Follow all instructions for URL validation and grant formatting from the base prompt, but your search is restricted to the data below.

**ADDITIONAL INSTRUCTIONS:**
*   The 'relevance' field for all new grants must be an array containing only this exact string: "${goal}".
*   Generate a unique, short, lowercase, snake_case 'id' for each new grant.
*   Do NOT include any grants from this list of existing ones: ${existingGrantNames}.

Return ONLY a JSON array of grant objects. If no new grants are found, return an empty array.

**PROVIDED CSV DATA (Source of Truth):**
${ragContent}
`;

    const prompt = ragContent ? ragPrompt : basePrompt;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: grantSchema
                },
            },
        });
        const newGrantsData = JSON.parse(response.text);
        const newGrants: Grant[] = Array.isArray(newGrantsData) ? newGrantsData : [];

        return newGrants.map(grant => {
            if (grant.solicitationUrl && !isValidUrl(grant.solicitationUrl)) {
                console.warn(`Gemini returned an invalid URL for new grant '${grant.name}'. Clearing it. URL: ${grant.solicitationUrl}`);
                grant.solicitationUrl = '';
            }
            return grant;
        });
    } catch (error) {
        console.error(`Error finding grants for goal "${goal}":`, error);
        return [];
    }
}

export async function synthesizeGrantStrategy(grants: Grant[]): Promise<StrategySummary> {
    const prompt = `
You are a world-class grant funding strategist. Your user is a research institution managing a portfolio of saved grant opportunities. Your task is to analyze their portfolio and provide a comprehensive, actionable strategic summary in JSON format.

**Instructions:**
1.  **Analyze the Data:** Carefully review the provided JSON data of grant opportunities, paying close attention to the 'purpose' and 'relevance' fields which indicate the user's strategic goals.
2.  **Overall Strategy:** Write a 2-3 sentence high-level summary of the portfolio's focus.
3.  **Funding Overview:** Calculate the total maximum potential funding, the average maximum award size, and the count of government vs. private grants.
4.  **Key Deadlines:** Identify up to 3 of the most immediate upcoming deadlines from grants with an 'Upcoming' status.
5.  **Thematic Clusters:** Group the grants into 2-4 thematic clusters based on their purpose or relevance. List the grant names under each theme.
6.  **Portfolio Goal Alignment:** Based on the 'relevance' fields across all grants, write a short analysis on how well the portfolio aligns with the institution's stated goals. Identify which goals are well-supported and which might be under-represented.
7.  **Grant-Specific Analysis:** For EACH grant in the portfolio, provide a detailed analysis including:
    *   **Proposal Approach:** A concise, actionable suggestion for a proposal's focus.
    *   **Solicitation Alignment:** Explain how the suggested approach directly addresses the grant's stated 'purpose' and a hypothetical solicitation's core requirements.
    *   **Campus Interest Alignment:** Describe how securing this grant would align with broad campus interests (e.g., advancing specific research fields, providing new student resources, enhancing technology infrastructure).
8.  **Strategic Advice:** Offer one or two pieces of concise, actionable advice based on the complete analysis.

**Grant Portfolio Data:**
${JSON.stringify(grants, null, 2)}

Return ONLY the JSON object that adheres to the provided schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: strategySchema,
            },
        });
        const summary = JSON.parse(response.text);
        return summary as StrategySummary;
    } catch (error) {
        console.error(`Error synthesizing grant strategy:`, error);
        throw new Error('Failed to generate grant strategy summary from AI.');
    }
}

export async function findPriorityGrant(savedGrants: Grant[]): Promise<{ grantId: string; rationale: string; nextSteps: string; }> {
    const prompt = `
You are a strategic grant funding advisor.
Analyze the following list of saved grants and identify the SINGLE highest priority opportunity that the user should pursue immediately.

Consider:
1. Immediacy of the deadline (Upcoming deadlines are higher priority).
2. Award size (Higher impact).
3. Strategic relevance (Clear alignment).

**Saved Grants:**
${JSON.stringify(savedGrants, null, 2)}

Return a JSON object identifying the priority grant ID, the rationale, and next steps.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: priorityGrantSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error finding priority grant:", error);
        throw error;
    }
}