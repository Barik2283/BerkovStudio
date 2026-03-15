// 🤖 BerkovStudio Bot Server для Replit/Glitch
// Готовый сервер для обработки кнопок Telegram

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// ========== НАСТРОЙКИ ==========
const TELEGRAM_BOT_TOKEN = '8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY';
const TELEGRAM_CHAT_ID = '5017662184';
// ================================

app.use(express.json());

// Хранилище заказов
let orders = [];

// Главная страница
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>BerkovStudio Bot</title></head>
            <body style="background:#0a0a0f;color:#00f5ff;font-family:monospace;padding:50px;text-align:center;">
                <h1>🤖 BerkovStudio Bot</h1>
                <p>Бот работает! ✅</p>
                <p>Webhook: /webhook/TOKEN</p>
                <p>Версия: 4.0</p>
            </body>
        </html>
    `);
});

// Webhook от Telegram
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    try {
        const update = req.body;
        console.log('Update:', JSON.stringify(update, null, 2));
        
        // Обработка callback query (нажатия кнопок)
        if (update.callback_query) {
            await handleCallback(update.callback_query);
        }
        
        // Обработка сообщений
        if (update.message) {
            await handleMessage(update.message);
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

// Обработка callback query
async function handleCallback(callback) {
    const data = callback.data;
    const messageId = callback.message.message_id;
    const chatId = callback.message.chat.id;
    
    console.log(`Callback: ${data} from ${callback.from.username}`);
    
    // Отвечаем на callback
    await telegramRequest('answerCallbackQuery', {
        callback_query_id: callback.id,
        show_alert: false
    });
    
    // Разбираем callback data
    const [action, orderId] = data.split('_');
    
    // Находим заказ
    const order = orders.find(o => o.id === orderId);
    
    switch(action) {
        case 'accept':
            if (order) {
                order.status = 'accepted';
                
                // Обновляем сообщение
                await telegramRequest('editMessageText', {
                    chat_id: chatId,
                    message_id: messageId,
                    text: callback.message.text + '\n\n✅ *ПРИНЯТ В РАБОТУ!*',
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            { text: '⏳ В работу', callback_data: `progress_${orderId}` },
                            { text: '✅ Готов', callback_data: `completed_${orderId}` }
                        ], [
                            { text: '📊 Инфо', callback_data: `info_${orderId}` }
                        ]]
                    })
                });
                
                // Уведомление клиенту
                if (order.tgNotifications) {
                    await telegramRequest('sendMessage', {
                        chat_id: order.contact,
                        text: `
╔══════════════════════════════════════╗
       ✅ *ЗАКАЗ ПРИНЯТ!*
╚══════════════════════════════════════╝

📋 ID: ${orderId}

Ваш заказ принят в работу!

⏱️ Срок: ${order.deadline || 'Обсуждается'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 BerkovStudio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        `,
                        parse_mode: 'Markdown'
                    });
                }
            }
            break;
            
        case 'progress':
            if (order) {
                order.status = 'progress';
                
                await telegramRequest('editMessageText', {
                    chat_id: chatId,
                    message_id: messageId,
                    text: callback.message.text.replace(/✅.*|⏳.*|🎉.*/g, '') + '\n\n⏳ *В РАБОТЕ!*',
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            { text: '✅ Готов', callback_data: `completed_${orderId}` },
                            { text: '📊 Инфо', callback_data: `info_${orderId}` }
                        ]]
                    })
                });
            }
            break;
            
        case 'completed':
            if (order) {
                order.status = 'completed';
                
                await telegramRequest('editMessageText', {
                    chat_id: chatId,
                    message_id: messageId,
                    text: callback.message.text.replace(/✅.*|⏳.*|🎉.*/g, '') + '\n\n🎉 *ЗАКАЗ ГОТОВ!*',
                    parse_mode: 'Markdown',
                    reply_markup: null
                });
                
                // Уведомление клиенту
                if (order && order.tgNotifications) {
                    await telegramRequest('sendMessage', {
                        chat_id: order.contact,
                        text: `
╔══════════════════════════════════════╗
       🎉 *ЗАКАЗ ГОТОВ!*
╚══════════════════════════════════════╝

📋 ID: ${orderId}

Ваш заказ готов!

💬 Для получения: @AntonCguryg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Спасибо за заказ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        `,
                        parse_mode: 'Markdown'
                    });
                }
            }
            break;
            
        case 'info':
            if (order) {
                const infoText = `
📋 *Информация о заказе ${orderId}*

👤 Клиент: @${order.contact}
📅 Дата: ${new Date(order.date).toLocaleDateString('ru-RU')}

💼 Детали:
├ Тариф: ${order.tariff || 'Не выбран'}
├ Дедлайн: ${order.deadline || 'Не указан'}
├ Тип: ${order.serviceType}
└ Статус: ${order.status}

📝 Описание:
${order.script.substring(0, 100)}${order.script.length > 100 ? '...' : ''}
                `;
                
                await telegramRequest('sendMessage', {
                    chat_id: chatId,
                    text: infoText,
                    parse_mode: 'Markdown'
                });
            }
            break;
            
        case 'stats':
            await sendStats(chatId);
            break;
            
        case 'tariffs':
            await sendTariffs(chatId);
            break;
    }
}

// Обработка сообщений
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username;
    
    console.log(`Message: ${text} from ${username}`);
    
    if (text === '/start') {
        await telegramRequest('sendMessage', {
            chat_id: chatId,
            text: `
╔══════════════════════════════════════╗
       🤖 *BerkovStudio Bot v4.0*
╚══════════════════════════════════════╝

Приветствую! Я бот для приёма заказов.

📋 *Мои возможности:*
• Приём заказов с сайта
• Отслеживание статусов
• Уведомления клиентов

💡 *Чтобы сделать заказ:*
Перейдите на сайт и заполните форму.

📱 *Поддержка:* @AntonCguryg
            `,
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        { text: '📊 Статистика', callback_data: 'stats' },
                        { text: '💰 Тарифы', callback_data: 'tariffs' }
                    ],
                    [
                        { text: 'ℹ️ Помощь', callback_data: 'help' }
                    ]
                ]
            })
        });
    }
    
    if (text === '/stats') {
        await sendStats(chatId);
    }
    
    if (text === '/tariffs') {
        await sendTariffs(chatId);
    }
    
    if (text === '/help') {
        await telegramRequest('sendMessage', {
            chat_id: chatId,
            text: `
╔══════════════════════════════════════╗
            ℹ️ *ПОМОЩЬ*
╚══════════════════════════════════════╝

*Команды:*
/start - Главное меню
/stats - Статистика
/tariffs - Информация о тарифах
/help - Эта справка

*Как сделать заказ:*
1. Перейдите на сайт
2. Заполните форму
3. Укажите Telegram
4. Получите подтверждение

👤 Создатель: @AntonCguryg
            `,
            parse_mode: 'Markdown'
        });
    }
}

// Отправка статистики
async function sendStats(chatId) {
    const stats = {
        total: orders.length,
        new: orders.filter(o => !o.status || o.status === 'new').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        progress: orders.filter(o => o.status === 'progress').length,
        completed: orders.filter(o => o.status === 'completed').length
    };
    
    await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: `
╔══════════════════════════════════════╗
        📊 *СТАТИСТИКА ЗАКАЗОВ*
╚══════════════════════════════════════╝

📋 *Всего:* ${stats.total}

📈 *По статусам:*
├ 🆕 Новые: ${stats.new}
├ ✅ Приняты: ${stats.accepted}
├ ⏳ В работе: ${stats.progress}
└ 🎉 Завершены: ${stats.completed}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 BerkovStudio Bot v4.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `,
        parse_mode: 'Markdown'
    });
}

// Отправка тарифов
async function sendTariffs(chatId) {
    await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: `
╔══════════════════════════════════════╗
            💰 *ТАРИФЫ*
╚══════════════════════════════════════╝

📦 *Базовый* ($1-$5)
├ Простой проект
├ Срок: 3-5 дней
└ Поддержка 7 дней

⭐ *Стандарт* ($6-$12) 🔥
├ Проект средней сложности
├ Срок: 7-14 дней
└ Поддержка 30 дней

💎 *Премиум* ($13-$20)
├ Сложный проект
├ Срок: 14-30 дней
└ Поддержка 90 дней

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 Принимаю все валюты!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `,
        parse_mode: 'Markdown'
    });
}

// Запрос к Telegram API
async function telegramRequest(method, data) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error(`Telegram API error (${method}):`, error);
        return null;
    }
}

// Запуск сервера
app.listen(port, () => {
    console.log('🤖 BerkovStudio Bot Server started on port', port);
    console.log('Webhook URL:', `https://YOUR-DOMAIN.com/webhook/${TELEGRAM_BOT_TOKEN}`);
});
