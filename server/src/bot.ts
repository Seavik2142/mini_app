import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN || '8833845544:AAGTuW9rZQHH9XLBsjSM3weWtFrwWtP2g94';
const rawWebAppUrl = process.env.MINI_APP_URL || 'http://localhost:5173/app';

// Ensure Web App URL is HTTPS for Telegram API compliance
const isHttps = rawWebAppUrl.startsWith('https://');
const webAppUrl = isHttps ? rawWebAppUrl : 'https://192.168.0.103:5173/app';

export const initBot = () => {
  try {
    const bot = new TelegramBot(token, { polling: true });

    console.log(`🤖 Telegram Bot listener initialized for bot @Sik_mybot (ID: 8833845544)...`);

    bot.on('polling_error', (err) => {
      if (err.message && !err.message.includes('EFATAL')) {
        return;
      }
      console.log('Bot Polling info:', err.message);
    });

    // Set Telegram Bot persistent Menu Button if HTTPS
    if (webAppUrl.startsWith('https://')) {
      (bot as any)
        ._request('setChatMenuButton', {
          form: {
            menu_button: JSON.stringify({
              type: 'web_app',
              text: '🔑 Open Key Vault',
              web_app: { url: webAppUrl }
            })
          }
        })
        .then(() => {
          console.log('✅ Bot Menu Button successfully updated to point to E-Commerce Mini App!');
        })
        .catch((err: any) => {
          console.log('Bot Menu Button setup info:', err?.message || err);
        });
    }

    // Setup Bot Commands
    bot
      .setMyCommands([
        { command: 'shop', description: '🔑 Open Digital Key Marketplace' },
        { command: 'vault', description: '📦 View My Purchased Keys' },
        { command: 'profile', description: '👤 My Profile & Balances' },
        { command: 'help', description: '💡 Shop Help & Support' }
      ])
      .catch(() => {});

    // Handle any message sent to bot
    bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'Shopper';
      const text = msg.text || '';

      if (text.startsWith('/help')) return;

      // Build Telegram compliant button (web_app if HTTPS, or standard URL)
      const shopButton = isHttps
        ? { text: '🔑 Open Digital Key Store', web_app: { url: webAppUrl } }
        : { text: '🔑 Open Digital Key Store', url: rawWebAppUrl };

      const vaultButton = isHttps
        ? { text: '📦 My Key Vault', web_app: { url: `${webAppUrl}/orders` } }
        : { text: '📦 My Key Vault', url: `${rawWebAppUrl}/orders` };

      const profileButton = isHttps
        ? { text: '👤 Balances & Profile', web_app: { url: `${webAppUrl}/profile` } }
        : { text: '👤 Balances & Profile', url: `${rawWebAppUrl}/profile` };

      bot.sendMessage(
        chatId,
        `🔑 *Welcome to Key Vault Store*, ${firstName}!\n\n` +
        `Instant redeemable activation keys for Telegram Premium, Steam, VPN passes, and Software licenses.\n\n` +
        `💰 *Pay in USD ($) or Khmer Riel (៛)*\n` +
        `🎁 *Use promo code TELEGRAM10 for 15% OFF!*`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [shopButton],
              [vaultButton, profileButton]
            ]
          }
        }
      ).catch((err) => {
        console.error('Failed to send bot message:', err.message);
      });
    });

    bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(
        chatId,
        `💡 *Key Vault Store Help*\n\n` +
        `• Send any message or /start to launch the Key Vault Store.\n` +
        `• Pay in USD ($) or Riel Khmer (៛).\n` +
        `• Use code TELEGRAM10 at checkout for 15% discount!\n\n` +
        `Need support? Contact @Sik_mybot`,
        { parse_mode: 'Markdown' }
      );
    });

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram Bot:', error);
    return null;
  }
};
