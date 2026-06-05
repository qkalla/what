const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();

// 🌐 تفعيل الرابط الأساسي ليعرض حالة البوت بشكل صحيح على الإنترنت
app.get('/', (req, res) => {
    res.send('<h1>🚀 Hakobyan LLC - Medusa Fleet v2 is Online & Active!</h1>');
});

// تفعيل منفذ السيرفر المخصص لـ Render
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

// 📊 قائمة الوظائف الحالية لشركة Hakobyan LLC
let currentJobs = [
    "🔹 *Vacancy 1:* Laundry Workers & Hotel Room Cleaners (7,000 AMD Daily).",
    "🔹 *Vacancy 2:* Construction Helpers & Kitchen Staff (Fixed Shifts available).",
    "🔹 *Visa Services:* Official V7 Invitation Letters (120 Days) & E-Visas for Indian & Bangladeshi Citizens."
];

let contactInfo = `📍 *Office Address:* Erebuni 3 Street, Armenia\n📞 *Official WhatsApp:* +374 332 41430`;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('qr', (qr) => {
    console.log('===========================================================');
    console.log('SCAN THIS QR CODE WITH YOUR IPHONE (SECOND NUMBER) NOW:');
    console.log('===========================================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🚀 MEDUSA FLEET V2 IS ACTIVE! Free 24/7 Hosting.');
});

// 🕹️ لوحة التحكم بالبوت من الواتساب
client.on('message_create', async (msg) => {
    const masterAdmin = '37433241430@c.us'; // رقمك الأساسي بدون +
    if (msg.from !== masterAdmin) return;

    if (msg.body.startsWith('!addjob ')) {
        const newJob = msg.body.replace('!addjob ', '').trim();
        currentJobs.push(`🔹 ${newJob}`);
        await msg.reply('✅ *Success:* New job vacancy added!');
    }

    if (msg.body === '!clearjobs') {
        currentJobs = [];
        await msg.reply('🧹 *Success:* All old vacancies deleted.');
    }

    if (msg.body === '!attack') {
        await msg.reply('⚔️ Launching group invasion...');
        runMedusaInvasion();
    }
});

// ⚔️ محرك النشر التلقائي وإرسال الصور والمصوص للجروبات
async function runMedusaInvasion() {
    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
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

// ⏰ الجدولة التلقائية: 3 مرات يومياً (9 صباحاً، 3 عصراً، 9 مساءً)
cron.schedule('0 9,15,21 * * *', () => {
    runMedusaInvasion();
});

client.initialize();
