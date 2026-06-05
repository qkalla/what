const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

// 1. Setup a lightweight web server to keep Render awake 24/7 for free
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Hakobyan LLC Automated Workspace is Active.'));
app.listen(port, () => console.log(`Web monitoring port active on: ${port}`));

// 2. Initialize WhatsApp client with human-emulation parameters
const client = new Client({
    authStrategy: new LocalAuth(), // Saves your login session so you don't scan the QR code twice
    puppeteer: {
        headless: true,
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

// Helper function to generate human-like random waiting times
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate the setup QR code in the Render terminal logs
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

// 3. Automated Scheduling Rule: Runs exactly at 9:00 AM and 9:00 PM every day
cron.schedule('0 9,21 * * *', async () => {
    console.log('Starting scheduled broadcast cycle...');
    try {
        const chats = await client.getChats();
        // Target group chats exclusively
        const groups = chats.filter(chat => chat.isGroup);
        
        // Your specific real business advertisement layout
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
                
                // Human Emulation Step A: Send "Presence Typing" status to the group first
                await group.sendStateTyping();
                
                // Human Emulation Step B: Random typing delay (between 4 to 9 seconds) so it looks natural
                const randomTypingDelay = Math.floor(Math.random() * (9000 - 4000 + 1)) + 4000;
                await wait(randomTypingDelay);
                
                // Human Emulation Step C: Clear typing status and dispatch the actual message
                await client.sendMessage(group.id._serialized, adMessage);
                console.log(`Post successfully delivered to group: ${group.name}`);
                
                // Human Emulation Step D: Rest period before navigating to the next group (between 12 to 25 seconds)
                const randomRestDelay = Math.floor(Math.random() * (25000 - 12000 + 1)) + 12000;
                await wait(randomRestDelay);
                
            } catch (groupError) {
                console.error(`Skipped group ${group.name} due to restrictive posting permissions:`, groupError.message);
            }
        }
        console.log('Daily broadcast cycle completed without any issues.');
    } catch (err) {
        console.error('Critical failure during broadcast operation:', err);
    }
});

client.initialize();
