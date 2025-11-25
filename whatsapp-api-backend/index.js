import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Variáveis de ambiente
const { META_TOKEN, PHONE_NUMBER_ID, WABA_ID, TEMPLATE_LANGUAGE } = process.env;

// Instância do Axios para a Meta API
const metaApi = axios.create({
    baseURL: 'https://graph.facebook.com/v21.0',
    headers: {
        'Authorization': `Bearer ${META_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Rota GET para buscar templates
app.get('/api/templates', async (req, res) => {
    try {
        const response = await metaApi.get(`/${WABA_ID}/message_templates`);

        const templates = response.data.data.map(t => ({
            name: t.name,
            language: t.language,
            status: t.status,
            category: t.category
        }));

        res.json({ templates });
    } catch (error) {
        console.error('Error fetching templates:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch templates from Meta' });
    }
});

// Rota POST para enviar template
app.post('/api/send-template', async (req, res) => {
    const { template, contacts } = req.body;

    if (!template) {
        return res.status(400).json({ error: 'Template não informado' });
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ error: 'Nenhum contato enviado' });
    }

    const results = [];
    const languageCode = TEMPLATE_LANGUAGE || 'pt_BR';

    try {
        const templateResponse = await metaApi.get(`/${WABA_ID}/message_templates`, {
            params: { name: template, language: languageCode }
        });

        const templateData = templateResponse.data.data.find(t => t.name === template);

        if (!templateData) {
            console.warn(`Template ${template} não encontrado.`);
        }

        const bodyComponent = templateData?.components?.find(c => c.type === 'BODY');
        const hasBodyParams = bodyComponent?.text && /\{\{\d+\}\}/.test(bodyComponent.text);

        // Check for Header parameters (IMAGE)
        const headerComponent = templateData?.components?.find(c => c.type === 'HEADER');
        const hasImageHeader = headerComponent?.format === 'IMAGE';

        console.log(`Enviando template: ${template}, Tem parâmetros no corpo: ${hasBodyParams}, Tem Imagem no Header: ${hasImageHeader}`);

        for (const contact of contacts) {
            try {
                const payload = {
                    messaging_product: "whatsapp",
                    to: contact.phone,
                    type: "template",
                    template: {
                        name: template,
                        language: { code: languageCode },
                        components: []
                    }
                };

                // Add Header Component if needed
                if (hasImageHeader) {
                    payload.template.components.push({
                        type: "header",
                        parameters: [
                            {
                                type: "image",
                                image: { link: "https://i.imgur.com/XgVtxHR.jpeg" }
                            }
                        ]
                    });
                }

                if (hasBodyParams) {
                    payload.template.components.push({
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: contact.name
                            }
                        ]
                    });
                }

                const response = await metaApi.post(`/${PHONE_NUMBER_ID}/messages`, payload);

                if (response.status === 200 || response.status === 201) {
                    results.push({
                        name: contact.name,
                        phone: contact.phone,
                        success: true,
                        messageId: response.data.messages?.[0]?.id
                    });
                }
            } catch (error) {
                console.error(`Erro ao enviar para ${contact.phone}:`, error.response?.data || error.message);
                results.push({
                    name: contact.name,
                    phone: contact.phone,
                    success: false,
                    error: error.response?.data || error.message
                });
            }
        }

        res.json({ results });

    } catch (error) {
        console.error('Erro no envio da campanha:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao processar a campanha', details: error.message });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
