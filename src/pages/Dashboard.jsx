import React, { useState } from 'react';
import { ContactUploader } from '../components/ContactUploader';
import { TemplateSelector } from '../components/TemplateSelector';
import { CampaignPreview } from '../components/CampaignPreview';
import { ResultsTable } from '../components/ResultsTable';
import { useTemplates } from '../hooks/useTemplates';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export function Dashboard() {
    const [selectedTemplateName, setSelectedTemplateName] = useState('');
    const [contacts, setContacts] = useState([]);
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const { templates } = useTemplates();

    const handleSendCampaign = async () => {
        if (!selectedTemplateName || contacts.length === 0) {
            setError('Selecione um template e adicione contatos.');
            return;
        }

        setSending(true);
        setError(null);
        setResults([]);

        try {
            // The requirement says: POST /api/send-template with { template, contacts }
            // Assuming the backend handles the bulk sending or we send one by one?
            // "O frontend deve fazer: POST /api/send-template ... contacts: [...]"
            // So it's a single bulk request.

            const payload = {
                template: selectedTemplateName,
                contacts: contacts
            };

            const response = await api.post('/send-template', payload);

            // Assuming backend returns results for each contact
            // If backend just says "OK", we might not have per-contact status immediately unless backend returns it.
            // Let's assume backend returns array of results or we simulate it if backend is async.
            // Requirement: "Tabela de Resultados ... Status (Enviado / Erro)"

            if (response.data && Array.isArray(response.data.results)) {
                setResults(response.data.results);
            } else {
                // Fallback if backend structure is different, just mark all as success for demo
                // or show generic success.
                // Let's assume response.data is the list of results.
                setResults(response.data);
            }

        } catch (err) {
            console.error(err);
            setError('Falha ao enviar campanha. Tente novamente.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-10">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto py-4 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                            W
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">Painel de Campanhas</h1>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Marketing Team
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4 md:px-6 space-y-8">

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-2 space-y-8">

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                                <h2 className="text-lg font-semibold">Configuração da Campanha</h2>
                            </div>

                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    <TemplateSelector
                                        value={selectedTemplateName}
                                        onChange={setSelectedTemplateName}
                                    />

                                    {/* Preview Mobile only here? No, let's keep preview on right for desktop */}
                                </CardContent>
                            </Card>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                                <h2 className="text-lg font-semibold">Destinatários</h2>
                            </div>

                            <ContactUploader onContactsChange={setContacts} />
                        </section>

                    </div>

                    {/* Right Column: Preview & Action */}
                    <div className="space-y-8">
                        <section className="space-y-4 sticky top-24">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                                <h2 className="text-lg font-semibold">Revisão & Envio</h2>
                            </div>

                            <CampaignPreview
                                templateName={selectedTemplateName}
                                templates={templates}
                            />

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total de Contatos:</span>
                                    <span className="font-medium">{contacts.length}</span>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    size="lg"
                                    className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all"
                                    onClick={handleSendCampaign}
                                    disabled={sending || !selectedTemplateName || contacts.length === 0}
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-5 w-5" />
                                            Enviar Campanha
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    Ao clicar em enviar, as mensagens serão processadas imediatamente.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Results Section */}
                {results.length > 0 && (
                    <section className="space-y-4 pt-8 border-t">
                        <h2 className="text-xl font-semibold">Relatório de Envio</h2>
                        <ResultsTable results={results} />
                    </section>
                )}

            </main>
        </div>
    );
}
