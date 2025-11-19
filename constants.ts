
import { Grant } from './types';

export const grantData: Grant[] = [
    {
        id: 'cc_star',
        name: 'NSF Campus Cyberinfrastructure (CC*) Program (NSF 24-530)',
        agency: 'National Science Foundation (NSF)',
        source: 'Government',
        purpose: 'Coordinated campus/regional CI improvements, including network upgrades, computing, and storage. Driven by STEM research needs.',
        relevance: [
            'Increasing our High Performance research network.',
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 100000,
        award_max: 1400000,
        award_text: 'Varies by area: $100k (Strategy) to $1.4M (Region). Total program funding $15M-$20M.',
        proposal_timing: 'Full Proposal: Oct 15, 2024 (upcoming)',
        award_timing: 'Within 6 months of deadline',
        status: 'Upcoming'
    },
    {
        id: 'cssi',
        name: 'NSF Cyberinfrastructure for Sustained Scientific Innovation (CSSI) (NSF 22-632)',
        agency: 'National Science Foundation (NSF)',
        source: 'Government',
        purpose: 'Flexible funding for evolving CI needs, emphasizing integrated CI services, software, and data services.',
        relevance: [
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 600000,
        award_max: 5000000,
        award_text: 'Elements: up to $600k. Frameworks: $600k-$5M. Total program funding $34M.',
        proposal_timing: 'Full Proposal: Dec 1, 2025 (upcoming)',
        award_timing: 'Within 6 months of deadline',
        status: 'Upcoming'
    },
    {
        id: 'cici',
        name: 'NSF Cybersecurity Innovation for Cyberinfrastructure (CICI) (NSF 25-531)',
        agency: 'National Science Foundation (NSF)',
        source: 'Government',
        purpose: 'Enhancing security and privacy of CI for scientific discovery, including securing AI-ready data and workflows.',
        relevance: [
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 600000,
        award_max: 1200000,
        award_text: 'Varies by area: $600k (UCSS/RSSD) to $1.2M (TCR). Total program funding $8M-$12M.',
        proposal_timing: 'Full Proposal: Apr 2, 2025; Jan 21, 2026',
        award_timing: 'Within 6 months of deadline',
        status: 'Upcoming'
    },
    {
        id: 'pposs',
        name: 'NSF Principles and Practice of Scalable Systems (PPoSS) (NSF 22-507)',
        agency: 'National Science Foundation (NSF)',
        source: 'Government',
        purpose: 'Basic research on scalability and correctness of modern applications, systems, and toolchains on heterogeneous architectures. (Program Archived)',
        relevance: [
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 250000,
        award_max: 5000000,
        award_text: 'Planning: up to $250k. LARGE: up to $5M. Total program funding $66M.',
        proposal_timing: 'Last Full Proposal: Jan 22, 2024 (past)',
        award_timing: 'Program archived',
        status: 'Past'
    },
    {
        id: 'mid_scale_ri_1',
        name: 'NSF Mid-scale Research Infrastructure-1 (Mid-scale RI-1) (NSF 24-598)',
        agency: 'National Science Foundation (NSF)',
        source: 'Government',
        purpose: 'Funds experimental research capabilities ($4M to <$20M), including computational hardware/software.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 4000000,
        award_max: 19999999,
        award_text: 'Implementation: $4M to <$20M. Design: $400k to <$20M. Total program funding $100M+.',
        proposal_timing: 'Preliminary Proposal: Nov 18, 2024. Full Proposal (by invitation): Jun 5, 2025.',
        award_timing: 'Earliest Start: Oct 1 of 2nd FY',
        status: 'Upcoming'
    },
    {
        id: 'doed_rdi',
        name: 'U.S. Dept of Education RDI Grant Program (CFDA 84.116H)',
        agency: 'U.S. Department of Education (DoED)',
        source: 'Government',
        purpose: 'Transformational investments in research infrastructure for HBCUs, TCCUs, and MSIs.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 1100000,
        award_max: 5000000,
        award_text: 'Varies, e.g., $1.1M-$5M.',
        proposal_timing: 'FY 2024 Deadline: Sep 16, 2024 (past)',
        award_timing: 'Before Dec 31, 2024',
        status: 'Past'
    },
    {
        id: 'dod_durip',
        name: 'DoD Defense University Research Instrumentation Program (DURIP)',
        agency: 'Department of Defense (DoD)',
        source: 'Government',
        purpose: 'Funding for major, state-of-the-art equipment for defense-related research.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.'
        ],
        award_min: 50000,
        award_max: 3000000,
        award_text: '$50k-$3M. AFOSR exceptions up to $7M. Total program funding ~$34M.',
        proposal_timing: 'FY 2026 Full Proposal: Apr 25, 2025',
        award_timing: 'Not specified',
        status: 'Upcoming'
    },
    {
        id: 'nih_sig',
        name: 'NIH Shared Instrumentation Grant (SIG) Program (S10)',
        agency: 'National Institutes of Health (NIH)',
        source: 'Government',
        purpose: 'Purchase/upgrade high-priced instruments for shared-use biomedical research (incl. computer clusters).',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 50000,
        award_max: 750000,
        award_text: '$50k-$750k (no indirect costs).',
        proposal_timing: 'June 2, 2025',
        award_timing: 'Not specified',
        status: 'Upcoming'
    },
    {
        id: 'nih_hei',
        name: 'NIH High-End Instrumentation (HEI) Grant Program (S10)',
        agency: 'National Institutes of Health (NIH)',
        source: 'Government',
        purpose: 'Purchase/upgrade high-end instruments ($750k-$2M) for shared-use biomedical research.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 750001,
        award_max: 2000000,
        award_text: '$750,001-$2M (no indirect costs).',
        proposal_timing: 'Typically aligns with SIG annual cycles (e.g., June 2025)',
        award_timing: 'Not specified',
        status: 'Upcoming'
    },
    {
        id: 'google_gara',
        name: 'Google Academic Research Awards (GARA)',
        agency: 'Google',
        source: 'Private',
        purpose: 'Supports foundational/applied research in computing, including leveraging Google AI for infrastructure.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 0,
        award_max: 150000,
        award_text: 'Unrestricted gifts up to $150,000.',
        proposal_timing: 'June 27 - July 17, 2024 (past)',
        award_timing: 'Announced Oct 3, 2024',
        status: 'Past'
    },
    {
        id: 'nvidia',
        name: 'NVIDIA Academic Grant Program',
        agency: 'NVIDIA',
        source: 'Private',
        purpose: 'Provides in-kind GPU computing access and hardware for academic research in AI/HPC.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.'
        ],
        award_min: 0,
        award_max: 0,
        award_text: 'In-kind: e.g., GPU hours, DGX Spark, Jetson/RTX kits.',
        proposal_timing: 'Rolling quarterly deadlines',
        award_timing: 'Quarterly decisions',
        status: 'Upcoming'
    },
    {
        id: 'microsoft',
        name: 'Microsoft Research Academic Programs',
        agency: 'Microsoft',
        source: 'Private',
        purpose: 'Catalyzes research collaboration, provides Azure access for AI/ML.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.'
        ],
        award_min: 0,
        award_max: 5000000,
        award_text: 'Varies; e.g., "AI for Good" $5M (Washington state specific).',
        proposal_timing: 'Varies by program',
        award_timing: 'Varies by program',
        status: 'Upcoming'
    },
    {
        id: 'ibm',
        name: 'IBM Academic Awards Program',
        agency: 'IBM',
        source: 'Private',
        purpose: 'Promotes research & collaboration, including AI for IT infrastructure and enterprise AI.',
        relevance: [
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 0,
        award_max: 5000000,
        award_text: 'Varies; e.g., "Education Security Grants" $5M (in-kind).',
        proposal_timing: 'Varies by program',
        award_timing: 'Not specified',
        status: 'Upcoming'
    },
    {
        id: 'aws',
        name: 'Amazon Research Awards (AWS AI)',
        agency: 'Amazon (AWS)',
        source: 'Private',
        purpose: 'Funds ML research and use of AWS ML tools.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.'
        ],
        award_min: 0,
        award_max: 170000,
        award_text: 'Unrestricted funds (avg $70k) & AWS Credits (avg $100k).',
        proposal_timing: 'Spring 2025: Mar 19 - May 7, 2025 (past)',
        award_timing: 'Varies',
        status: 'Past'
    },
     {
        id: 'czi',
        name: 'Chan Zuckerberg Initiative (CZI) AI RFA',
        agency: 'Chan Zuckerberg Initiative',
        source: 'Private',
        purpose: 'In-kind GPU resource allocations for large-scale AI/ML models in biological sciences.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.'
        ],
        award_min: 0,
        award_max: 0,
        award_text: 'In-kind: minimum 96 GPUs.',
        proposal_timing: 'Rolling reviews until May 12, 2025 (past)',
        award_timing: 'Dependent on project scope',
        status: 'Past'
    },
    {
        id: 'moore',
        name: 'Gordon and Betty Moore Foundation',
        agency: 'Moore Foundation',
        source: 'Private',
        purpose: 'Supports scientific discovery, including data-driven discovery and data infrastructure.',
        relevance: [
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 1900000,
        award_max: 3800000,
        award_text: 'Varies widely; e.g., $1.9M-$3.8M for science grants.',
        proposal_timing: 'Rolling/Program-specific',
        award_timing: 'Varies by program',
        status: 'Upcoming'
    },
    {
        id: 'schmidt',
        name: 'Schmidt Futures / Schmidt Sciences',
        agency: 'Schmidt Futures',
        source: 'Private',
        purpose: 'Supports researchers in AI & Advanced Computing for scientific and societal challenges.',
        relevance: [
            'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
            'Establishing a research support center of excellence in HPC and AI.'
        ],
        award_min: 500000,
        award_max: 10000000,
        award_text: 'Varies; e.g., up to $10M for Virtual Institutes.',
        proposal_timing: 'Varies by program; multiple deadlines in 2025',
        award_timing: 'Not specified',
        status: 'Upcoming'
    },
];

export const initialRelevanceMap: { [key: string]: string } = {
    'ai-gpu': 'Enhancing campus researcher clusters with new AI or GPU tools and hardware.',
    'hpc-coe': 'Establishing a research support center of excellence in HPC and AI.',
    'network': 'Increasing our High Performance research network.'
};
