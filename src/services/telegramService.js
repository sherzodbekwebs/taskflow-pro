const TELEGRAM_BOT_TOKEN = '8530081337:AAFiPtKK0eaRCdfXuumy8_AbPzQ5bLzVGvI';
const TELEGRAM_GROUP_ID = '-1003743663215';

const TelegramService = {
    sendNotification: async (task, assignedUser, type = 'create') => {
        const mention = assignedUser?.tg_username
            ? `[@${assignedUser.tg_username.replace('@', '')}](tg://resolve?domain=${assignedUser.tg_username.replace('@', '')})`
            : `*${assignedUser?.fullName || 'Tayinlanmagan'}*`;

        let header = "📝 *Yangi topshiriq shakllantirildi*";
        if (type === 'update') header = "🔄 *Topshiriq tahrirlandi*";
        if (type === 'delete') header = "🗑 *Topshiriq tizimdan o'chirildi*";

        const message = `
${header}

📌 *Vazifa:* ${task.title}
⚖️ *Ustuvorlik:* ${task.priority}
📊 *Holat:* ${task.status}
📅 *Muddat:* ${task.deadline ? new Date(task.deadline).toLocaleDateString('uz-UZ') : 'Belgilanmagan'}
👤 *Mas'ul:* ${mention}

_TaskFlow — Nazorat va unumdorlik_
🌐 [Tizimga o'tish](https://taskflow-pro-eta.vercel.app/)
    `.trim();

        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_GROUP_ID,
                    text: message,
                    parse_mode: 'Markdown',
                    // Linklar bosilishi qulay bo'lishi uchun previewni o'chirib qo'yish ham mumkin:
                    disable_web_page_preview: false 
                }),
            });
        } catch (error) {
            console.error("Telegram error:", error);
        }
    }
};

export default TelegramService;