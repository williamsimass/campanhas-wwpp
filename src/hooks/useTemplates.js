import { useState, useEffect } from 'react';
import api from '../services/api';

export function useTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const response = await api.get('/templates');
                setTemplates(response.data.templates || []);
            } catch (err) {
                setError(err);
                // Mock data for development if API fails (optional, but good for demo)
                // setTemplates([
                //   { name: 'hello_world', language: 'en_US', category: 'MARKETING' },
                //   { name: 'promo_janeiro', language: 'pt_BR', category: 'MARKETING' }
                // ]);
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
    }, []);

    return { templates, loading, error };
}
