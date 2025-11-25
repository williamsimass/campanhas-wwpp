import axios from 'axios';
import fs from 'fs';

async function test() {
    console.log('Sending test request...');
    try {
        const response = await axios.post('http://localhost:3000/api/send-template', {
            template: 'mwebchat',
            contacts: [{ name: 'Test User', phone: '5511999999999' }]
        });

        const result = response.data.results[0];
        let msg = '';
        if (result.success) {
            msg = `VERIFY_RESULT: SUCCESS\nMessage ID: ${result.messageId}`;
        } else {
            msg = `VERIFY_RESULT: FAILURE\nError Details: ${JSON.stringify(result.error, null, 2)}`;
        }
        console.log(msg);
        fs.writeFileSync('verify_output.txt', msg);

    } catch (error) {
        const msg = `VERIFY_RESULT: NETWORK_ERROR\nError: ${JSON.stringify(error.response?.data || error.message, null, 2)}`;
        console.log(msg);
        fs.writeFileSync('verify_output.txt', msg);
    }
}

test();
