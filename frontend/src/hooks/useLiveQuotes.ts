import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function useLiveQuotes(symbols: string[], pollIntervalMs = 15000) {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [status, setStatus] = useState<'LIVE' | 'DELAYED' | 'OFFLINE'>('LIVE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!symbols.length) return;
        let isMounted = true;

        const fetchQuotes = async () => {
            try {
                const res = await apiClient.get(`/market/quotes?symbols=${symbols.join(',')}`);
                if (isMounted) {
                    setQuotes(res.data);
                    setStatus(res.data.some((q: any) => q.is_delayed) ? 'DELAYED' : 'LIVE');
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setStatus('OFFLINE');
                    setLoading(false);
                }
            }
        };

        fetchQuotes();
        const intervalId = setInterval(fetchQuotes, pollIntervalMs);
        
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [symbols.join(','), pollIntervalMs]);

    return { quotes, status, loading };
}