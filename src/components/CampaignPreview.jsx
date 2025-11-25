import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export function CampaignPreview({ templateName, templates }) {
    const template = templates.find(t => t.name === templateName);

    if (!templateName) {
        return (
            <Card className="h-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <p>Selecione um template para visualizar</p>
                </CardContent>
            </Card>
        );
    }

    if (!template) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-destructive">Template não encontrado.</p>
                </CardContent>
            </Card>
        );
    }

    // Helper to render components (Header, Body, Footer, Buttons)
    // Assuming standard WhatsApp Cloud API structure
    const renderComponent = (component, index) => {
        switch (component.type) {
            case 'HEADER':
                return (
                    <div key={index} className="font-bold text-lg mb-2">
                        {component.format === 'TEXT' && component.text}
                        {component.format === 'IMAGE' && (
                            <div className="bg-gray-200 h-32 w-full rounded-md flex items-center justify-center text-gray-500">
                                [Imagem]
                            </div>
                        )}
                    </div>
                );
            case 'BODY':
                return (
                    <div key={index} className="whitespace-pre-wrap text-sm mb-2">
                        {component.text}
                    </div>
                );
            case 'FOOTER':
                return (
                    <div key={index} className="text-xs text-gray-500 mt-2">
                        {component.text}
                    </div>
                );
            case 'BUTTONS':
                return (
                    <div key={index} className="mt-4 space-y-2">
                        {component.buttons.map((btn, i) => (
                            <div key={i} className="w-full text-center py-2 text-blue-500 bg-white border rounded shadow-sm text-sm font-medium">
                                {btn.text}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="bg-[#E5DDD5] border-none shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-gray-500 flex justify-between">
                    <span>Preview da Mensagem</span>
                    <Badge variant="outline" className="bg-white">{template.language}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%] relative">
                    {/* If template has components, render them. Else fallback to name */}
                    {template.components ? (
                        template.components.map((c, i) => renderComponent(c, i))
                    ) : (
                        <div className="text-sm">
                            <p className="font-bold mb-1">{template.name}</p>
                            <p className="text-gray-500 italic">Conteúdo não disponível para preview</p>
                        </div>
                    )}

                    <div className="text-[10px] text-gray-400 text-right mt-1">
                        12:00
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
