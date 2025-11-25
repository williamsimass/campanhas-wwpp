import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Upload, Trash2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function ContactUploader({ onContactsChange }) {
    const [manualInput, setManualInput] = useState('');
    const [contacts, setContacts] = useState([]);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const parseManualInput = (text) => {
        const lines = text.split('\n');
        const parsed = lines
            .map(line => {
                const [name, phone] = line.split(';');
                if (name && phone) {
                    return { name: name.trim(), phone: phone.trim().replace(/\D/g, '') };
                }
                return null;
            })
            .filter(Boolean);
        return parsed;
    };

    const handleManualChange = (e) => {
        const text = e.target.value;
        setManualInput(text);
        const parsed = parseManualInput(text);
        // We only update the parent when valid contacts exist, but we might want to merge with CSV
        // For simplicity, let's keep manual and CSV separate or merge them?
        // The requirement says "Campo para o usuário colar contatos... E Upload de CSV".
        // Let's assume they add to the same list.
        // But if I type in textarea, it's "live". CSV is "imported".
        // Let's make the textarea the "source of truth" for manual, and CSV appends to it?
        // Or just have a single list of "Ready Contacts".

        // Let's go with: Textarea is for quick copy-paste. CSV adds to the list.
        // Actually, if we have a list, we should display it in a table.
        // If user types in textarea, should it auto-populate the table?
        // Yes.

        // Let's keep it simple:
        // 1. Textarea for manual entry.
        // 2. CSV upload parses and APPENDS to the manual text (or just adds to a list).
        // If we append to text, it's easy to edit.
        // "Name;Phone" format.

        // If I upload CSV, I can convert it to "Name;Phone" string and append to textarea.
        // This makes the textarea the single source of truth and easy to edit.
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError('Erro ao ler CSV: ' + results.errors[0].message);
                    return;
                }

                const newContacts = results.data.map(row => {
                    // Try to find name and phone columns (case insensitive)
                    const keys = Object.keys(row);
                    const nameKey = keys.find(k => k.toLowerCase().includes('nome') || k.toLowerCase().includes('name'));
                    const phoneKey = keys.find(k => k.toLowerCase().includes('numero') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('celular'));

                    if (nameKey && phoneKey) {
                        return `${row[nameKey]};${row[phoneKey]}`;
                    }
                    return null;
                }).filter(Boolean);

                if (newContacts.length > 0) {
                    const currentText = manualInput ? manualInput + '\n' : '';
                    const newText = currentText + newContacts.join('\n');
                    setManualInput(newText);
                    setError(null);
                    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
                } else {
                    setError('Não foi possível identificar colunas "nome" e "numero" no CSV.');
                }
            },
            error: (err) => {
                setError('Falha ao ler arquivo: ' + err.message);
            }
        });
    };

    // Effect to update parent whenever manualInput changes
    React.useEffect(() => {
        const parsed = parseManualInput(manualInput);
        setContacts(parsed);
        onContactsChange(parsed);
    }, [manualInput, onContactsChange]);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Entrada Manual</CardTitle>
                        <CardDescription>
                            Cole seus contatos abaixo no formato: <strong>Nome;Telefone</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Ex: João Silva;5511999999999&#10;Maria;5521988888888"
                            className="min-h-[200px] font-mono text-sm"
                            value={manualInput}
                            onChange={handleManualChange}
                        />
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                                {contacts.length} contatos identificados
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() => setManualInput('')}
                                disabled={!manualInput}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Limpar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Importar CSV</CardTitle>
                        <CardDescription>
                            Arquivo .csv com colunas <strong>nome</strong> e <strong>numero</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="rounded-full bg-muted p-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                            <Label
                                htmlFor="csv-upload"
                                className="cursor-pointer text-sm font-medium text-primary hover:underline"
                            >
                                Clique para selecionar o arquivo
                            </Label>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <p className="text-xs text-muted-foreground">
                                Suporta apenas arquivos .csv
                            </p>
                        </div>
                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {contacts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Prévia da Lista ({contacts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[300px] overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contacts.map((contact, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{contact.name}</TableCell>
                                            <TableCell>{contact.phone}</TableCell>
                                            <TableCell>
                                                <span className="flex items-center text-xs text-green-600 font-medium">
                                                    Pronto
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
