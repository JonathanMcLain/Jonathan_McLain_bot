require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Bot, Keyboard, InlineKeyboard } = require('grammy');

// Настройка логгирования
const logStream = fs.createWriteStream(path.join(__dirname, 'bot.log'), { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  logStream.write(logMessage);
  console.log(logMessage);
};

const bot = new Bot(process.env.BOT_API_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (err) {
      console.error('Ошибка webhook:', err);
      res.status(500).send('Error');
    }
  });

// ========== КОМАНДЫ БОТА ========== //
bot.api.setMyCommands([
  { command: 'start', description: 'Старт бота' },
  { command: 'say_me', description: 'Говорит что-то' },
  { command: 'help', description: 'Список всех команд' },
  { command: 'id', description: 'Покажет ваш ID' },
  { command: 'share', description: 'Поделиться своими данными' },
  { command: 'mood', description: 'Спросит ваше настроение' },
  { command: 'choice', description: 'Загадать цифру' },
]);

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Я - Бот.');
  log(`Пользователь ${ctx.from.id} вызвал /start`);
});

bot.command('id', async (ctx) => {
  await ctx.reply(`Ваш ID: ${ctx.from.id}`);
  log(`Пользователь ${ctx.from.id} запросил ID`);
});

bot.command('help', async (ctx) => {
    await ctx.reply('Тут находятся все команды бота: \n\n /start - Запуск бота. \n /help - Вызвать помощь по командам. \n /say_me - бот скажет рандомную фразу. \n /id - Скажет ваш ID. \n /share - Поделится с данными боту. \n /mood - Спросит ваше настроение. \n /choice - угадает вами загаданное число.')
})
bot.command('say_me', async (ctx) => {
    await ctx.reply('Я люблю бананы')
})
bot.command('mood', async (ctx) => {
    const moodKeyboard = new Keyboard().text('Хорошо').text('Нормально').text('Плохо').resized().oneTime()
    await ctx.reply('Как твоё настроение?', {
        reply_markup: moodKeyboard
    })
})
bot.hears('Хорошо', async (ctx) => {
    await ctx.reply('Отлично')
})
bot.hears('Нормально', async (ctx) => {
    await ctx.reply('Отлично')
})
bot.hears('Плохо', async (ctx) => {
    await ctx.reply('Это плохо...')
})
bot.command('share', async (ctx) => {
    const shareKeyboard = new Keyboard().requestLocation('Геолокация').requestContact('Контакт').requestPoll('Опрос').resized().oneTime()

    await ctx.reply('Чем хочешь поделиться?', {
        reply_markup: shareKeyboard
    })
} )
bot.command('choice', async (ctx) => {
    const InlineKeyboard2 = new InlineKeyboard().text('1', '1').text('2', '2').text('3', '3')

    await ctx.reply('Загадай цифру', {
        reply_markup: InlineKeyboard2,
    })
})
bot.on('callback_query:data', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(`Я думаю ты загадал цифру: ${ctx.callbackQuery.data}`)
    ctx.editMessageReplyMarkup(null);
})
bot.on(':contact', async (ctx) => {
    await ctx.reply('Отлично, ты отправил мне свои контакты')
})
bot.on(':location', async (ctx) => {
    await ctx.reply('Отлично, ты отправил мне свою локацию')
})
bot.on(':poll', async (ctx) => {
    await ctx.reply('Отлично, ты отправил опрос')
})
// ===== ЗАПУСК СЕРВЕРА ===== //
const startServer = async () => {
    if (process.env.NODE_ENV === 'production') {
      // Режим для Render.com (Webhook)
      app.use(express.json());
      
      app.post('/webhook', async (req, res) => {
        try {
          await bot.handleUpdate(req.body, res);
        } catch (err) {
          console.error('Webhook error:', err);
          res.status(500).send('Error');
        }
      });
  
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Webhook mode)`);
      });
    } else {
      // Локальный режим (Polling)
      bot.start();
      console.log('Bot started in polling mode');
    }
  };
  
  startServer().catch(console.error);
  
  // Обработка ошибок
  bot.catch(err => console.error('Bot error:', err));