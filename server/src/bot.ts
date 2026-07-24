/**
 * Telegram Bot — OTP via Deep Link
 *
 * Flow:
 *   1. Mini App backend creates a sessionId and returns deepLink:
 *      https://t.me/Sik_mybot?start=SESSION_ID
 *
 *   2. User opens that link in Telegram → triggers /start SESSION_ID
 *
 *   3. Bot:
 *      a. Looks up sessionId in otpStore
 *      b. Stores user's chatId on the session
 *      c. Sends the OTP code to the user's chat
 *
 *   4. User enters the code in the Mini App → POST /user/otp/verify
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
    // /start SESSION_ID  — OTP Deep Link Handler
    // ──────────────────────────────────────────────────
    bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      const sessionId = match?.[1]?.trim();

      if (!sessionId) {
        // Plain /start without session — show welcome
        return sendWelcome(bot, chatId, firstName);
      }

      const session = getSession(sessionId);

      if (!session) {
        await bot.sendMessage(
          chatId,
          `⚠️ *This verification link has expired.*\n\nPlease go back to the Mini App and request a new code.`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Attach this user's chatId and real Telegram identity to the session
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

      // Send the OTP code to the user
      await bot.sendMessage(
        chatId,
        `🔐 *Your Mini App Login Code*\n\n` +
        `Hello ${firstName}! Here is your 6-digit verification code:\n\n` +
        `\`${session.otp}\`\n\n` +
        `⏳ Expires in *${minutes}m ${seconds}s*\n` +
        `🔒 Do not share this code with anyone.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '↩️ Back to Mini App', web_app: { url: webAppUrl } }
            ]]
          }
        }
      );

      console.log(`[OTP SENT] Session: ${sessionId} | ChatId: ${chatId} | Code: ${session.otp}`);
    });

    // ──────────────────────────────────────────────────
    // Plain /start (no session)
    // ──────────────────────────────────────────────────
    bot.onText(/^\/start$/, (msg) => {
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User');
    });

    // ──────────────────────────────────────────────────
    // All other messages
    // ──────────────────────────────────────────────────
    bot.on('message', (msg) => {
      if (msg.text?.startsWith('/')) return;
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User');
    });

    // Setup Bot Commands & Menu
    bot.setMyCommands([
      { command: 'start', description: '🚀 Open Mini App' },
      { command: 'shop', description: '🔑 Digital Key Marketplace' },
      { command: 'help', description: '💡 Help & Support' }
    ]).catch(() => {});

    (bot as any)._request('setChatMenuButton', {
      form: {
        menu_button: JSON.stringify({
          type: 'web_app',
          text: '🔑 Open Key Vault',
          web_app: { url: webAppUrl }
        })
      }
    }).catch(() => {});

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram Bot:', error);
    return null;
  }
};

function sendWelcome(bot: TelegramBot, chatId: number, firstName: string) {
  bot.sendMessage(
    chatId,
    `👋 *Welcome to Key Vault Store, ${firstName}!*\n\n` +
    `🔑 Buy instant activation keys for:\n` +
    `• Telegram Premium\n• Steam Games\n• VPN Passes\n• Software Licenses\n\n` +
    `💰 Pay in *USD ($)* or *Khmer Riel (៛)*`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔑 Open Key Vault Store', web_app: { url: webAppUrl } }],
          [
            { text: '📦 My Orders', web_app: { url: `${webAppUrl}/orders` } },
            { text: '👤 Profile', web_app: { url: `${webAppUrl}/profile` } }
          ]
        ]
      }
    }
  ).catch(console.error);
}
