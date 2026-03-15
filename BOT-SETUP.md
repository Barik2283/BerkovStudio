# 🤖 BerkovStudio Bot — Полная настройка

## ⚠️ Почему кнопки не работают?

Кнопки в Telegram не работают без **сервера**, потому что:
- Telegram отправляет нажатия кнопок на ваш сервер
- Сайт на HTML/JS не может принимать запросы от Telegram
- Нужен веб-сервер с HTTPS

## ✅ Решение 1: Replit (Бесплатно, 5 минут)

### Шаг 1: Создайте проект на Replit

1. Зайдите на https://replit.com
2. Нажмите **"Create Repl"**
3. Выберите шаблон **"Node.js"**
4. Назовите проект: `berkovstudio-bot`

### Шаг 2: Создайте файл bot.js

Скопируйте этот код в `bot.js`:

```javascript
const express = require('express');
const app = express();
const port = 3000;

const TELEGRAM_BOT_TOKEN = '8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY';
const TELEGRAM_CHAT_ID = '5017662184';

app.use(express.json());

// Хранилище заказов
let orders = [];

// Webhook от Telegram
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    try {
        const update = req.body;
        
        // Обработка callback query (кнопки)
        if (update.callback_query) {
            const callback = update.callback_query;
            const data = callback.data;
            const messageId = callback.message.message_id;
            
            console.log('Callback:', data);
            
            // Отвечаем Telegram
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callback.id,
                    show_alert: false
                })
            });
            
            // Обработка кнопок
            if (data.startsWith('accept_')) {
                // Обновляем сообщение
                fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        message_id: messageId,
                        text: callback.message.text + '\n\n✅ *ПРИНЯТ В РАБОТУ!*',
                        parse_mode: 'Markdown',
                        reply_markup: JSON.stringify({
                            inline_keyboard: [[
                                { text: '⏳ В работу', callback_data: 'progress_' + data.split('_')[1] },
                                { text: '✅ Готов', callback_data: 'completed_' + data.split('_')[1] }
                            ]]
                        })
                    })
                });
            }
            
            if (data.startsWith('progress_')) {
                fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        message_id: messageId,
                        text: callback.message.text + '\n\n⏳ *В РАБОТЕ!*',
                        parse_mode: 'Markdown',
                        reply_markup: JSON.stringify({
                            inline_keyboard: [[
                                { text: '✅ Готов', callback_data: 'completed_' + data.split('_')[1] }
                            ]]
                        })
                    })
                });
            }
            
            if (data.startsWith('completed_')) {
                fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        message_id: messageId,
                        text: callback.message.text + '\n\n🎉 *ЗАКАЗ ГОТОВ!*',
                        parse_mode: 'Markdown',
                        reply_markup: null
                    })
                });
            }
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

// Команды бота
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    const update = req.body;
    
    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        if (text === '/start') {
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: '🤖 BerkovStudio Bot v4.0\n\nБот для приёма заказов.',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            { text: '📊 Статистика', callback_data: 'stats' },
                            { text: '💰 Тарифы', callback_data: 'tariffs' }
                        ]]
                    })
                })
            });
        }
        
        if (text === '/stats') {
            fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `📊 Статистика:\n\nВсего заказов: ${orders.length}`
                })
            });
        }
    }
    
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`🤖 Bot server running on port ${port}`);
});
```

### Шаг 3: Добавьте package.json

```json
{
  "name": "berkovstudio-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### Шаг 4: Настройте Webhook

1. Запустите проект кнопкой **"Run"**
2. Скопируйте URL вашего проекта (например: `https://berkovstudio-bot.yourusername.repl.co`)
3. Откройте в браузере:
   ```
   https://api.telegram.org/bot8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY/setWebhook?url=https://berkovstudio-bot.yourusername.repl.co/webhook/8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY
   ```
4. Должно появиться: `{"ok":true,"result":true,"description":"Webhook was set"}`

### Шаг 5: Проверьте работу

1. Откройте бота в Telegram
2. Нажмите `/start`
3. Должны появиться кнопки

---

## ✅ Решение 2: Glitch (Бесплатно, проще)

### Шаг 1: Создайте проект

1. Зайдите на https://glitch.com
2. Нажмите **"New Project"** → **"glitch-hello-node"**
3. Назовите проект: `berkovstudio-bot`

### Шаг 2: Замените код в server.js

Удалите всё и вставьте код из Решения 1 (bot.js выше)

### Шаг 3: Добавьте зависимости

В файле `package.json` добавьте:
```json
"dependencies": {
  "express": "^4.18.2"
}
```

### Шаг 4: Настройте Webhook

1. Нажмите **"Share"** → скопируйте URL проекта
2. Откройте:
   ```
   https://api.telegram.org/bot8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY/setWebhook?url=https://YOUR-PROJECT-URL.glitch.me/webhook/8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY
   ```

---

## ✅ Решение 3: Без сервера (упрощённое)

Если не хотите настраивать сервер, кнопки не будут работать, но заказы всё равно будут приходить текстом!

**Что будет работать:**
- ✅ Заявки приходят в Telegram
- ✅ Клиент получает подтверждение
- ✅ Сохранение в localStorage

**Что НЕ будет работать:**
- ❌ Кнопки "Принять заказ"
- ❌ Изменение статуса
- ❌ Команды бота

---

## 🐛 Проверка работы

### Проверьте Webhook:
```
https://api.telegram.org/bot8415434289:AAGyWPDpIIGF19DYIr20Jd4XArtuMLcMRKY/getWebhookInfo
```

Должно быть:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-url.com/webhook/...",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Проверьте бота:
1. Откройте бота в Telegram
2. Нажмите `/start`
3. Если появилось меню — всё работает!

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте токен бота
2. Проверьте Chat ID
3. Проверьте URL webhook

**Создатель:** Антон Чигур  
**Telegram:** @AntonCguryg

---

&copy; 2026 BerkovStudio
