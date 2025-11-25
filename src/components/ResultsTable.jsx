import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import Papa from 'papaparse';

export function ResultsTable({ results }) {
    const handleExport = () => {
        const csv = Papa.unparse(results);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `campanha_resultados_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!results || results.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Resultados do Envio</h3>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Detalhes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.phone}</TableCell>
                                <TableCell>
                                    {row.success ? (
                                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                            <CheckCircle className="mr-1 h-3 w-3" /> Enviado
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                                            <XCircle className="mr-1 h-3 w-3" /> Erro
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground font-mono">
                                    {row.messageId || row.error}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
