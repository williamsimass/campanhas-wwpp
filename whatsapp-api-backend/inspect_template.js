import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const { META_TOKEN, WABA_ID } = process.env;

const metaApi = axios.create({
    baseURL: 'https://graph.facebook.com/v21.0',
    headers: {
        'Authorization': `Bearer ${META_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function inspectTemplate() {
    try {
        console.log('Fetching template details for: mwebchat');
        const response = await metaApi.get(`/${WABA_ID}/message_templates`, {
            params: {
                name: 'mwebchat',
                language: 'pt_BR'
            }
        });

        const template = response.data.data.find(t => t.name === 'mwebchat');
        if (template) {
            console.log('TEMPLATE STRUCTURE SAVED TO template_structure.json');
            fs.writeFileSync('template_structure.json', JSON.stringify(template, null, 2));
        } else {
            console.log('Template not found.');
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

inspectTemplate();
