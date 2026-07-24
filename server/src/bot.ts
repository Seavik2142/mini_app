/**
 * Telegram Bot — OTP & Mini App Management Bot
 *
 * Commands:
 *   /start    - New User Welcome & Mini App Launcher
 *   /update   - Refresh bot configuration & menu buttons
 *   /clear    - Reset/Clear active OTP verification sessions
 *   /shop     - Open Key Vault Marketplace
 *   /help     - Show command list & help support
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import {
  getSession,
  attachTelegramUser,
  getSecondsUntilExpiry,
} from './utils/otpStore';

dotenv.config();

const token = process.env.BOT_TOKEN!;
const webAppUrl = process.env.MINI_APP_URL || 'https://mini-app1-one.vercel.app/app';
const BOT_USERNAME = 'Sik_mybot';

let botInstance: TelegramBot | null = null;

export const getBot = (): TelegramBot | null => botInstance;

export const initBot = () => {
  try {
    const bot = new TelegramBot(token, { polling: true });
    botInstance = bot;

    console.log(`🤖 Telegram Bot @${BOT_USERNAME} initialized`);

    bot.on('polling_error', (err) => {
      if (err.message && !err.message.includes('EFATAL')) return;
      console.log('Bot Polling error:', err.message);
    });

    // ──────────────────────────────────────────────────
    // 1. /start SESSION_ID — OTP Deep Link Handler
    // ──────────────────────────────────────────────────
    bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      const sessionId = match?.[1]?.trim();

      if (!sessionId) {
        return sendWelcome(bot, chatId, firstName);
      }

      const session = getSession(sessionId);

      if (!session) {
        await bot.sendMessage(
          chatId,
          `⚠️ *This verification link has expired or is invalid.*\n\nPlease go back to the Mini App and request a new code.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '🚀 Open Mini App', web_app: { url: webAppUrl } }
              ]]
            }
          }
        );
        return;
      }

      // Attach user's chatId and real Telegram identity to session
      if (msg.from) {
        attachTelegramUser(sessionId, chatId, {
          id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code
        });
      }

      const expiresIn = getSecondsUntilExpiry(sessionId);
      const minutes = Math.floor(expiresIn / 60);
      const seconds = expiresIn % 60;

      // Send the 6-digit OTP code
      await bot.sendMessage(
        chatId,
        `🔐 *Your Mini App Verification Code*\n\n` +
        `Hello *${firstName}*! Here is your 6-digit verification code:\n\n` +
        `\`${session.otp}\`\n\n` +
        `⏳ Valid for *${minutes}m ${seconds}s*\n` +
        `🔒 Do not share this code with anyone.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '↩️ Open Mini App to Verify', web_app: { url: webAppUrl } }
            ]]
          }
        }
      );

      console.log(`[OTP SENT] Session: ${sessionId} | ChatId: ${chatId} | Code: ${session.otp}`);
    });

    // ──────────────────────────────────────────────────
    // 2. Plain /start — New User Start / Welcome
    // ──────────────────────────────────────────────────
    bot.onText(/^\/start$/, (msg) => {
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User');
    });

    // ──────────────────────────────────────────────────
    // 3. /update — Update/Refresh Bot Config & Menu
    // ──────────────────────────────────────────────────
    bot.onText(/\/update|\/refresh/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';

      await updateBotMenu(bot);

      await bot.sendMessage(
        chatId,
        `🔄 *Bot Configuration & Menu Refreshed!*\n\n` +
        `Hello ${firstName}, the bot menu and links have been updated to the latest version.\n\n` +
        `• Web App URL: \`${webAppUrl}\`\n` +
        `• Menu Button: *🔑 Open Key Vault*\n` +
        `• All commands active.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open Key Vault Store', web_app: { url: webAppUrl } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 4. /clear — Clear Session & Reset Bot State
    // ──────────────────────────────────────────────────
    bot.onText(/\/clear|\/reset/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';

      await bot.sendMessage(
        chatId,
        `🧹 *Session Cleared & Reset!*\n\n` +
        `Hello ${firstName}, your active verification sessions have been cleared.\n\n` +
        `If you need to log in again, request a new code from the Mini App.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔑 Open Key Vault Store', web_app: { url: webAppUrl } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 5. /shop — Marketplace Launcher
    // ──────────────────────────────────────────────────
    bot.onText(/\/shop/, (msg) => {
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User');
    });

    // ──────────────────────────────────────────────────
    // 6. /help — Command Guide
    // ──────────────────────────────────────────────────
    bot.onText(/\/help/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `💡 *Key Vault Bot Help Guide*\n\n` +
        `Available Commands:\n` +
        `• /start - 🚀 Open Mini App & Welcome\n` +
        `• /update - 🔄 Refresh Bot Menu & Config\n` +
        `• /clear - 🧹 Reset & Clear Sessions\n` +
        `• /shop - 🔑 Digital Key Marketplace\n` +
        `• /help - 💡 Show this help guide`,
        { parse_mode: 'Markdown' }
      );
    });

    // Register Menu Commands & Button
    updateBotMenu(bot);

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram Bot:', error);
    return null;
  }
};

async function updateBotMenu(bot: TelegramBot) {
  try {
    await bot.setMyCommands([
      { command: 'start', description: '🚀 Open Mini App & Welcome' },
      { command: 'update', description: '🔄 Refresh Bot Menu & Config' },
      { command: 'clear', description: '🧹 Clear & Reset Sessions' },
      { command: 'shop', description: '🔑 Digital Key Marketplace' },
      { command: 'help', description: '💡 Help & Support' }
    ]);

    await (bot as any)._request('setChatMenuButton', {
      form: {
        menu_button: JSON.stringify({
          type: 'web_app',
          text: '🔑 Open Key Vault',
          web_app: { url: webAppUrl }
        })
      }
    });
    console.log('✅ Bot menu & commands registered successfully');
  } catch (e) {
    console.log('Bot menu setup notice:', e);
  }
}

function sendWelcome(bot: TelegramBot, chatId: number, firstName: string) {
  bot.sendMessage(
    chatId,
    `👋 *Welcome to Key Vault Store, ${firstName}!*\n\n` +
    `🔑 Buy instant activation keys for:\n` +
    `• Telegram Premium\n• Steam Games & Wallet Cards\n• VPN Passes & Licenses\n• Software Keys\n\n` +
    `💰 Pay with *KHQR*, *USD ($)*, or *Khmer Riel (៛)*\n\n` +
    `Tap below to open the Mini App:`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔑 Open Key Vault Store', web_app: { url: webAppUrl } }],
          [
            { text: '📦 My Orders', web_app: { url: `${webAppUrl}/orders` } },
            { text: '👤 Profile', web_app: { url: `${webAppUrl}/profile` } }
          ],
          [
            { text: '🔄 Refresh Bot Menu', callback_data: 'refresh' },
            { text: '💡 Help Guide', callback_data: 'help' }
          ]
        ]
      }
    }
  ).catch(console.error);
}
