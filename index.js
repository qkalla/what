const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Hakobyan LLC Automated Workspace is Active.'));
app.listen(port, () => console.log(`Web monitoring port active on: ${port}`));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Let puppeteer pick up the Environment Variable automatically
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('qr', (qr) => {
    console.log('===========================================================');
    console.log('SCAN THIS QR CODE WITH YOUR SECOND PHONE NUMBER RIGHT NOW:');
    console.log('===========================================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Success! Hakobyan LLC bot is authenticated and running 24/7.');
    console.log('You can now completely shut down your laptop.');
});

cron.schedule('0 9,21 * * *', async () => {
    console.log('Starting scheduled broadcast cycle...');
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        const adMessage = `📢 *Hakobyan LLC - Employment & Visa Services* 📢\n\n` +
                          `🔹 *Armenia Vacancies:* Laundry Workers & Hotel Checkout Room Cleaners.\n` +
                          `🔹 *Salary/Shifts:* 7,000 AMD Daily. Fixed shifts available.\n` +
                          `🔹 *Visa Services:* Official V7 Invitation Letters (120 Days) & E-Visas processed directly for Indian & Bangladeshi Citizens. Real proof available on request!\n\n` +
                          `📍 *Office Address:* Erebuni 3 Street, Armenia\n` +
                          `📞 *Official WhatsApp:* +374 332 41430\n\n` +
                          `⚠️ *Warning:* Deal directly with us. Beware of fake agents in this group!`;

        for (const group of groups) {
            try {
                console.log(`Simulating human behavior for group: ${group.name}`);
                await group.sendStateTyping();
                const randomTypingDelay = Math.floor(Math.random() * (9000 - 4000 + 1)) + 4000;
                await wait(randomTypingDelay);
                
                await client.sendMessage(group.id._serialized, adMessage);
                console.log(`Post successfully delivered to group: ${group.name}`);
                
                const randomRestDelay = Math.floor(Math.random() * (25000 - 12000 + 1)) + 12000;
                await wait(randomRestDelay);
                
            } catch (groupError) {
                console.error(`Skipped group ${group.name}:`, groupError.message);
            }
        }
        console.log('Daily broadcast cycle completed.');
    } catch (err) {
        console.error('Critical failure during broadcast operation:', err);
    }
});

client.initialize();
