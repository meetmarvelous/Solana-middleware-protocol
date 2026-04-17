export const Icons = {
    Simulate: () => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 11C3 6.58 6.58 3 11 3s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8Z" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" />
            <path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Optimize: () => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 16l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
            <path d="M18 8V6h-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
    ),
    Route: () => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="4" cy="11" r="1.5" fill="currentColor" fillOpacity="0.6" />
            <circle cx="18" cy="6" r="1.5" fill="currentColor" />
            <circle cx="18" cy="16" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <path d="M5.5 11H10l2.5-5H16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <path d="M5.5 11H10l2.5 5H16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
    ),
    Send: () => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 11l16-7-6 7 6 7-16-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeOpacity="0.9" />
            <path d="M13 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
        </svg>
    ),
    Retry: () => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4.5 11A6.5 6.5 0 0 1 17 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
            <path d="M17.5 11A6.5 6.5 0 0 1 5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M15 5.5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
            <path d="M3 12.5l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    SimulationFeat: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.3" />
            <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    FeeFeat: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 12.5l3-3.5 2.5 2.5L12 6l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    RouteFeat: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="3" cy="9" r="1.2" fill="currentColor" fillOpacity="0.5" />
            <circle cx="15" cy="4.5" r="1.2" fill="currentColor" />
            <circle cx="15" cy="13.5" r="1.2" fill="currentColor" fillOpacity="0.5" />
            <path d="M4.2 9H8l2-4.5H13.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M4.2 9H8l2 4.5H13.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
    ),
    RetryFeat: () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.5 9A5.5 5.5 0 0 1 13 5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.6" />
            <path d="M14.5 9A5.5 5.5 0 0 1 5 12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M11.5 4l2 1.5 1.5-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
            <path d="M2.5 10.5l1.5 2 2-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Logo: () => (
        <img src="/logo.png" alt="Sendra Logo" width="55" height="55" className="rounded-md object-contain" />
    ),
};