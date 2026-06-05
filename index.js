const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Medusa Fleet Status: Active.'));
app.listen(process.env.PORT || 8080, () => console.log('Web Port Active.'));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ]
    }
});

let currentAdMessage = `📢 *Hakobyan LLC - Employment & Visa Services* 📢\n\n` +
                       `🔹 *Armenia Vacancies:* Laundry Workers & Hotel Room Cleaners.\n` +
                       `🔹 *Salary/Shifts:* 7,000 AMD Daily.\n` +
                       `🔹 *Visa Services:* Official V7 Invitation Letters (120 Days) & E-Visas for Indian & Bangladeshi Citizens.\n\n` +
                       `📞 *Official WhatsApp:* +374 332 41430`;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('qr', (qr) => {
    console.log('===========================================================');
    console.log('SCAN THIS QR CODE WITH YOUR SECOND NUMBER RIGHT NOW:');
    console.log('===========================================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 MEDUSA FLEET IS ACTIVE ON KOYEB! You can close your laptop.');
});

client.on('message_create', async (msg) => {
    const masterAdmin = '37433241430@c.us'; // رقمك الأساسي بدون +
    if (msg.from !== masterAdmin) return;

    if (msg.body.startsWith('!setad ')) {
        currentAdMessage = msg.body.replace('!setad ', '');
        await msg.reply('✅ *Panel Updated:* Advertisement text updated successfully!');
    }

    if (msg.body === '!attack') {
        await msg.reply('⚔️ Launching immediate group invasion...');
        runMedusaInvasion();
    }

    if (msg.body.startsWith('!join ')) {
        const inviteLink = msg.body.replace('!join ', '').trim();
        try {
            const code = inviteLink.split('chat.whatsapp.com/')[1];
            if (code) {
                await client.acceptInvite(code);
                await msg.reply('📥 *Success:* Joined the new group!');
            }
        } catch (err) {
            await msg.reply(`❌ Failed: ${err.message}`);
        }
    }
});

async function runMedusaInvasion() {
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        for (const group of groups) {
            try {
                await group.sendStateTyping();
                await wait(Math.floor(Math.random() * 4000) + 4000);
                await client.sendMessage(group.id._serialized, currentAdMessage);
                await wait(Math.floor(Math.random() * 10000) + 15000); // لمنع الحظر
            } catch (e) {}
        }
    } catch (err) {}
}

cron.schedule('0 9,21 * * *', () => { runMedusaInvasion(); });
client.initialize();
