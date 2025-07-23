process.on('uncaughtException', (err) => {
    console.error('Необработанная ошибка:', err);
    process.exit(1); // Принудительно завершаем процесс
  });
  
require('dotenv').config()
const app = express(); 
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy')

const bot = new Bot(process.env.BOT_API_KEY)

bot.api.setMyCommands ([
    {
        command: 'start',
        description: 'Старт бота',
    },
    {
        command: 'say_me',
        description: 'Говорит что-то',
    },
    {
        command: 'help',
        description: 'Список всех команд',
    },
    {
        command: 'id',
        description: 'Покажет ваш ID',
    },
    {
        command: 'share',
        description: 'Поделиться своими данными',
    },
    {
        command: 'mood',
        description: 'Спросит ваше настроение',
    },
    {
        command: 'choice',
        description: 'Загадать цифру',
    },
]);

bot.command('start', async (ctx) => {
    await ctx.reply('Привет! Я - Бот.')
})
bot.command('id', async (ctx) => {
    await ctx.reply(`Ваш ID: ${ctx.from.id}`)
})
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
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}`);
    const e = err.error;

    if(e instanceof GrammyError){
        console.error("Error in request:", e.description);
    }
    else if (e instanceof HttpError){
        console.error("Could not contact Telegram:", e);
    } 
    else {
        console.error("Unknown error", e);
    }
})

if (process.env.NODE_ENV === 'production') {
    bot.api.setWebhook(`https://your-render-url.onrender.com/webhook`);
    app.use(webhookCallback(bot, 'express'));
    app.listen(3000, () => console.log('Бот запущен через Webhook'));
  } else {
    bot.start(); // Локально используем polling
  }