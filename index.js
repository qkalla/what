const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const express = require('express');

// نظام ويب وهمي لإبقاء السيرفر مستيقظاً مجاناً
const app = express();
app.get('/', (req, res) => res.send('Hakobyan LLC Bot is Online!'));
app.listen(process.env.PORT || 3000, () => console.log('Web server running'));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// لعرض الرمز على شاشة اللابتوب أو السيرفر
client.on('qr', (qr) => {
    console.log('امسح الرمز التالي باستخدام هاتفك الثاني الآن:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('البوت متصل الآن بنجاح ويعمل 24/7!');
    
    // جدولة النشر التلقائي: الساعة 9 صباحاً والساعة 9 مساءً
    cron.schedule('0 9,21 * * *', async () => {
        try {
            const chats = await client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            
            const message = `📢 *Hakobyan LLC - Employment & Visa Services* 📢\n\n` +
                            `🔹 *Armenia Jobs:* Laundry & Hotel Cleaners (7,000 AMD Daily).\n` +
                            `🔹 *Visa Services:* V7 Invitation (120 Days) & E-Visa for Indian/Bangladeshi.\n\n` +
                            `📞 WhatsApp Us Safely: *+374 332 41430*`;

            for (const group of groups) {
                await client.sendMessage(group.id._serialized, message);
                await new Promise(resolve => setTimeout(resolve, 5000)); // تأخير 5 ثوانٍ لحماية حسابك
            }
            console.log('تم إرسال المنشورات للمجموعات تلقائياً!');
        } catch (err) {
            console.error('خطأ في الإرسال:', err);
        }
    });
});

client.initialize();