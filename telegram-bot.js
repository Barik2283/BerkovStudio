// 🤖 BerkovStudio Telegram Bot
// Улучшенный бот для обработки заказов

const TELEGRAM_BOT_TOKEN = '8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY';
const TELEGRAM_CHAT_ID = '5017662184';

// Хранилище заказов
let orders = [];

// Загрузка заказов из localStorage (если есть)
if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('berkovOrders');
    if (saved) {
        orders = JSON.parse(saved);
    }
}

function saveOrders() {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('berkovOrders', JSON.stringify(orders));
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Создание красивого сообщения о заказе
function createOrderMessage(order) {
    return `
╔══════════════════════════════════════╗
     🎮 *НОВАЯ ЗАЯВКА НА РАЗРАБОТКУ*
╚══════════════════════════════════════╝

📋 *ID заказа:* #${order.id}
📅 *Дата:* ${formatDate(order.date)}

👤 *Клиент:*
├ Контакт: \`${order.contact}\`
├ Тариф: *${order.tariff}*
└ Дедлайн: ${order.deadline || 'Не указан'}

🛠️ *Проект:*
├ Услуга: *${order.service}*
└ Описание:
${order.script}

💰 *Ориентировочная стоимость:* ${order.price || 'По тарифу'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Статус: *${order.status || 'Новый'}*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

// Клавиатура для управления заказом
function getOrderKeyboard(orderId) {
    return {
        inline_keyboard: [
            [
                { text: '✅ Принят', callback_data: `status_accepted_${orderId}` },
                { text: '⏳ В работе', callback_data: `status_progress_${orderId}` }
            ],
            [
                { text: '✏️ Редактировать', callback_data: `edit_${orderId}` },
                { text: '🗑️ Удалить', callback_data: `delete_${orderId}` }
            ],
            [
                { text: '📊 Статистика', callback_data: 'stats' },
                { text: '📋 Все заказы', callback_data: 'all_orders' }
            ]
        ]
    };
}

// Главное меню
function getMainMenuKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📋 Новые заказы', callback_data: 'new_orders' },
                { text: '⏳ В работе', callback_data: 'progress_orders' }
            ],
            [
                { text: '✅ Завершённые', callback_data: 'completed_orders' },
                { text: '📊 Статистика', callback_data: 'stats' }
            ],
            [
                { text: '💰 Тарифы', callback_data: 'tariffs' },
                { text: 'ℹ️ Помощь', callback_data: 'help' }
            ]
        ]
    };
}

// Обработка callback query
async function handleCallback(queryId, data, message) {
    const [action, value] = data.split('_');
    
    switch(action) {
        case 'status':
            const orderId = value + '_' + arguments[2];
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = arguments[1];
                saveOrders();
                await sendMessage(TELEGRAM_CHAT_ID, `✅ Статус заказа #${orderId} изменён на "${order.status}"`);
            }
            break;
            
        case 'delete':
            const delId = value;
            const index = orders.findIndex(o => o.id === delId);
            if (index !== -1) {
                orders.splice(index, 1);
                saveOrders();
                await sendMessage(TELEGRAM_CHAT_ID, `🗑️ Заказ #${delId} удалён`);
            }
            break;
            
        case 'stats':
            const stats = getStatistics();
            await sendMessage(TELEGRAM_CHAT_ID, formatStatistics(stats));
            break;
            
        case 'tariffs':
            await sendMessage(TELEGRAM_CHAT_ID, getTariffsInfo());
            break;
            
        case 'help':
            await sendMessage(TELEGRAM_CHAT_ID, getHelpInfo());
            break;
    }
    
    // Answer callback query
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: queryId })
    });
}

// Статистика
function getStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
        total: orders.length,
        new: orders.filter(o => o.status === 'Новый').length,
        progress: orders.filter(o => o.status === 'В работе').length,
        completed: orders.filter(o => o.status === 'Завершён').length,
        today: orders.filter(o => new Date(o.date) >= today).length
    };
}

function formatStatistics(stats) {
    return `
╔══════════════════════════════════════╗
        📊 *СТАТИСТИКА ЗАКАЗОВ*
╚══════════════════════════════════════╝

📋 *Всего заказов:* ${stats.total}

📈 *По статусам:*
├ 🆕 Новые: ${stats.new}
├ ⏳ В работе: ${stats.progress}
└ ✅ Завершённые: ${stats.completed}

📅 *За сегодня:* ${stats.today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 *BerkovStudio Bot* v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

// Информация о тарифах
function getTariffsInfo() {
    return `
╔══════════════════════════════════════╗
            💰 *ТАРИФЫ*
╚══════════════════════════════════════╝

📦 *Базовый* ($1-$5)
├ Простой проект
├ Базовый функционал
├ Срок: 3-5 дней
└ Поддержка 7 дней

⭐ *Стандарт* ($6-$12) 🔥
├ Проект средней сложности
├ Расширенный функционал
├ Срок: 7-14 дней
└ Поддержка 30 дней

💎 *Премиум* ($13-$20)
├ Сложный проект
├ Полный функционал
├ Срок: 14-30 дней
└ Поддержка 90 дней

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 *Принимаю все валюты!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

// Помощь
function getHelpInfo() {
    return `
╔══════════════════════════════════════╗
            ℹ️ *ПОМОЩЬ*
╚══════════════════════════════════════╝

🤖 *BerkovStudio Bot v2.0*

*Возможности:*
• 📋 Приём заказов с сайта
• 📊 Статистика заказов
• ⚡ Быстрые ответы
• 🔔 Уведомления

*Команды:*
/start - Главное меню
/stats - Статистика
/tariffs - Информация о тарифах
/help - Эта справка

*Для связи:*
👤 Создатель: @AntonCguryg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 *BerkovStudio* — Качество и надёжность
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

// Отправка сообщения
async function sendMessage(chatId, text, keyboard = null) {
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    };
    
    if (keyboard) {
        body.reply_markup = JSON.stringify(keyboard);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    return await response.json();
}

// Экспорт для использования на сайте
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendMessage,
        createOrderMessage,
        getOrderKeyboard,
        handleCallback,
        getStatistics,
        formatStatistics,
        getTariffsInfo,
        getHelpInfo
    };
}

console.log('🤖 BerkovStudio Bot loaded successfully!');
