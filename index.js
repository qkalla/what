const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');

const app = express();
let latestQR = ''; // لتخزين الرمز كصورة

// 🌐 عند فتح رابط موقعك، ستجد الـ QR Code نظيفاً ومثلياً أمامك تماماً!
app.get('/', (req, res) => {
    if (latestQR) {
        res.send(`
            <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
                <h2>🚀 Hakobyan LLC - Medusa Fleet v2</h2>
                <p style="color: green; font-weight: bold;">Scan this perfect QR Code with your WhatsApp now:</p>
                <img src="${latestQR}" style="border: 10px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); width: 300px; height: 300px;" />
                <p style="margin-top: 20px; color: #666;">Refresh the page if the code expires.</p>
            </div>
        `);
    } else {
        res.send('<h1 style="text-align: center; margin-top: 50px;">🚀 Medusa Fleet is Online. Generating QR Code, please refresh in 10 seconds...</h1>');
    }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Web Monitor Active on port ${port}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ]
    }
});

// قائمة الوظائف الحالية
let currentJobs = [
    "🔹 *Vacancy 1:* Laundry Workers & Hotel Room Cleaners (7,000 AMD Daily).",
    "🔹 *Vacancy 2:* Construction Helpers & Kitchen Staff (Fixed Shifts available).",
    "🔹 *Visa Services:* Official V7 Invitation Letters (120 Days) & E-Visas for Indian & Bangladeshi Citizens."
];

let contactInfo = `📍 *Office Address:* Erebuni 3 Street, Armenia\n📞 *Official WhatsApp:* +374 332 41430`;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to extract phone number from WhatsApp ID
function extractPhoneNumber(whatsappId) {
    if (!whatsappId) return '';
    // Extract the phone number part before @c.us or @g.us
    const match = whatsappId.match(/^(\d+)/);
    return match ? match[1] : whatsappId;
}

// Helper function to verify if sender is master admin
function isMasterAdmin(sender) {
    const MASTER_ADMIN_PHONE = '37494290481';
    const senderPhone = extractPhoneNumber(sender);
    return senderPhone === MASTER_ADMIN_PHONE;
}

// توليد الرمز كرابط صورة بدلاً من طباعته مكسوراً في السجلات
client.on('qr', (qr) => {
    latestQR = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
    console.log('===========================================================');
    console.log('🔗 QR CODE GENERATED SUCCESSFULLY!');
    console.log(`👉 OPEN THIS LINK TO SCAN: https://whatybot.onrender.com`);
    console.log('===========================================================');
});

client.on('ready', () => {
    console.log('🚀 MEDUSA FLEET V2 IS ACTIVE! Connected to your phone.');
    latestQR = ''; // إخفاء الرمز بعد نجاح الاتصال
});

// لوحة التحكم بالبوت من الواتساب - Robust Admin Command Handler
client.on('message_create', async (msg) => {
    // Get sender ID from direct chat (msg.from) or group chat (msg.author)
    const sender = msg.author || msg.from;
    
    // Verify if sender is the master admin using flexible phone number matching
    if (!isMasterAdmin(sender)) {
        console.log(`[⛔] Unauthorized command attempt from: ${sender}`);
        return;
    }
    
    console.log(`[✅] Admin command received from master admin: ${msg.body}`);
    
    try {
        // Command: !addjob
        if (msg.body.startsWith('!addjob ')) {
            const newJob = msg.body.replace('!addjob ', '').trim();
            if (newJob.length === 0) {
                await msg.reply('❌ *Error:* Please provide a job vacancy description.');
                return;
            }
            currentJobs.push(`🔹 ${newJob}`);
            await msg.reply('✅ *Success:* New job vacancy added!');
            console.log(`[+] Job added: ${newJob}`);
        }
        // Command: !clearjobs
        else if (msg.body === '!clearjobs') {
            currentJobs = [];
            await msg.reply('🧹 *Success:* All old vacancies deleted.');
            console.log('[+] All jobs cleared');
        }
        // Command: !attack
        else if (msg.body === '!attack') {
            await msg.reply('⚔️ Launching group invasion...');
            console.log('[+] Medusa Invasion launched by admin!');
            runMedusaInvasion();
        }
        // Command: !help
        else if (msg.body === '!help') {
            const helpText = `📋 *Medusa Fleet v2 - Admin Commands:*\n\n` +
                           `!addjob <description> - Add a new job vacancy\n` +
                           `!clearjobs - Clear all job vacancies\n` +
                           `!attack - Launch group invasion with current jobs\n` +
                           `!help - Show this help message`;
            await msg.reply(helpText);
        }
        else {
            await msg.reply('❌ *Unknown command.* Type !help for available commands.');
        }
    } catch (error) {
        console.error('Error processing admin command:', error);
        await msg.reply('❌ *Error:* Failed to process command. Check bot logs.');
    }
});

async function runMedusaInvasion() {
    try {
        const groups = await client.getChats().then(chats => chats.filter(chat => chat.isGroup));

        let fullAdMessage = `📢 *Hakobyan LLC - Dynamic Employment Updates* 📢\n\n` +
                            `Current Available Vacancies in Armenia:\n` + 
                            currentJobs.join('\n') + `\n\n` +
                            contactInfo + `\n\n` +
                            `⚠️ *Deal directly with our official number to avoid agent scams!*`;

        const imageMedia = await MessageMedia.fromUrl('https://images.unsplash.com/photo-1521737711867-e3b904737372?q=80&w=600', { unsafeMime: true });

        for (const group of groups) {
            try {
                await group.sendStateTyping();
                await wait(Math.floor(Math.random() * 5000) + 4000);

                await client.sendMessage(group.id._serialized, imageMedia, { caption: fullAdMessage });
                console.log(`[+] Posted to: ${group.name}`);

                await wait(Math.floor(Math.random() * 10000) + 15000); 
            } catch (e) {}
        }
    } catch (err) {
        console.error('Invasion error:', err);
    }
}

cron.schedule('0 9,15,21 * * *', () => {
    runMedusaInvasion();
});

client.initialize();
