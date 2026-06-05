const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Medusa Fleet is Running Free.'));
app.listen(process.env.PORT || 8080, () => console.log('Port Active.'));

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

// 📊 قائمة الوظائف الحالية لشركة Hakobyan LLC (يمكنك تغييرها من هاتفك في أي وقت)
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

// 🕹️ لوحة التحكم بالبوت مباشرة من تطبيق الواتساب الخاص بك
client.on('message_create', async (msg) => {
    const masterAdmin = '37433241430@c.us'; // رقمك الأساسي بدون علامة +
    if (msg.from !== masterAdmin) return;

    // أمر إضافة وظيفة جديدة حقيقية للقائمة فوراً
    if (msg.body.startsWith('!addjob ')) {
        const newJob = msg.body.replace('!addjob ', '').trim();
        currentJobs.push(`🔹 ${newJob}`);
        await msg.reply('✅ *Success:* New job vacancy added!');
    }

    // أمر مسح جميع الوظائف القديمة لكتابة قائمة جديدة
    if (msg.body === '!clearjobs') {
        currentJobs = [];
        await msg.reply('🧹 *Success:* All old vacancies deleted.');
    }

    // أمر إطلاق هجوم ونشر إعلاني فوري للمجموعات مع الصورة بدون انتظار وقت الجدولة
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
        
        // تجميع نص الإعلان بشكل منظم مع الوظائف الحقيقية المحدثة
        let fullAdMessage = `📢 *Hakobyan LLC - Dynamic Employment Updates* 📢\n\n` +
                            `Current Available Vacancies in Armenia:\n` + 
                            currentJobs.join('\n') + `\n\n` +
                            contactInfo + `\n\n` +
                            `⚠️ *Deal directly with our official number to avoid agent scams!*`;

        // جلب صورة توظيف احترافية وتوليدها تلقائياً مع الإعلان لتبدو جذابة للعملاء
        const imageMedia = await MessageMedia.fromUrl('https://images.unsplash.com/photo-1521737711867-e3b904737372?q=80&w=600', { unsafeMime: true });

        for (const group of groups) {
            try {
                // إظهار البوت في الجروب كأنه يكتب الآن (محاكاة بشرية لحماية الرقم من الحظر)
                await group.sendStateTyping();
                await wait(Math.floor(Math.random() * 5000) + 4000);

                // إرسال الصورة وبداخلها نص الوظائف بالكامل
                await client.sendMessage(group.id._serialized, imageMedia, { caption: fullAdMessage });
                console.log(`[+] Posted to: ${group.name}`);

                // انتظار وقت عشوائي بين الجروبات لضمان عدم حظر رقمك
                await wait(Math.floor(Math.random() * 10000) + 15000); 
            } catch (e) {}
        }
    } catch (err) {
        console.error('Invasion error:', err);
    }
}

// ⏰ الجدولة التلقائية: النشر 3 مرات يومياً بدقة شديدة
// الساعة 9 صباحاً، الساعة 3 عصراً (15)، والساعة 9 مساءً (21)
cron.schedule('0 9,15,21 * * *', () => {
    console.log('⏰ Time to attack! Executing 3-times-a-day schedule...');
    runMedusaInvasion();
});

client.initialize();
