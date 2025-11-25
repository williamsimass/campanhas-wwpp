import React from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

export function TemplateSelector({ value, onChange }) {
    const { templates, loading, error } = useTemplates();

    if (loading) {
        return (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando templates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Erro ao carregar templates. Verifique a conexão com a API.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="template-select">Selecione o Template</Label>
            <select
                id="template-select"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Selecione um template...</option>
                {templates.map((template) => (
                    <option key={template.name} value={template.name}>
                        {template.name} ({template.language}) - {template.category}
                    </option>
                ))}
            </select>
        </div>
    );
}
