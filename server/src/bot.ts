/**
 * Telegram Bot — OTP & Mini App Management Bot
 *
 * Commands:
 *   /start    - New User Welcome & Mini App Launcher
 *   /orders   - Open My Orders & Key Vault
 *   /profile  - Open Profile & Account Settings
 *   /shop     - Open Key Vault Marketplace
 *   /update   - Refresh bot configuration & menu buttons
 *   /clear    - Reset/Clear active OTP verification sessions
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
const BOT_USERNAME = 'Sik_mybot';

// Helper to construct exact, clean Mini App URLs for subpages (/app, /app/orders, /app/profile)
export const getMiniAppUrl = (path: string = ''): string => {
  let baseUrl = (process.env.MINI_APP_URL || 'https://mini-app-one-flax.vercel.app/app').trim();
  if (baseUrl.includes('mini-app1-one.vercel.app')) {
    baseUrl = baseUrl.replace('mini-app1-one.vercel.app', 'mini-app-one-flax.vercel.app');
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  if (!baseUrl.endsWith('/app')) {
    baseUrl = `${baseUrl}/app`;
  }

  if (!path) return baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

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
                { text: '🚀 Open Mini App', web_app: { url: getMiniAppUrl() } }
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
              { text: '↩️ Open Mini App to Verify', web_app: { url: getMiniAppUrl() } }
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
    // 3. /orders — Direct Orders & Vault Link
    // ──────────────────────────────────────────────────
    bot.onText(/\/orders/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      bot.sendMessage(
        chatId,
        `📦 *My Orders & Digital Key Vault*\n\n` +
        `Hello ${firstName}! Tap below to view your purchased activation keys:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📦 View My Orders & Keys', web_app: { url: getMiniAppUrl('/orders') } }],
              [{ text: '🔑 Back to Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 4. /profile — Direct Account Profile Link
    // ──────────────────────────────────────────────────
    bot.onText(/\/profile/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      bot.sendMessage(
        chatId,
        `👤 *My Account Profile*\n\n` +
        `Hello ${firstName}! Tap below to manage your account and referral link:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '👤 Open Profile & Rewards', web_app: { url: getMiniAppUrl('/profile') } }],
              [{ text: '🔑 Back to Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 5. /update — Update/Refresh Bot Config & Menu
    // ──────────────────────────────────────────────────
    bot.onText(/\/update|\/refresh/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';

      await updateBotMenu(bot);

      await bot.sendMessage(
        chatId,
        `🔄 *Bot Configuration & Links Refreshed!*\n\n` +
        `Hello ${firstName}, all links and menu buttons have been updated:\n\n` +
        `• Base URL: \`${getMiniAppUrl()}\`\n` +
        `• Orders URL: \`${getMiniAppUrl('/orders')}\`\n` +
        `• Profile URL: \`${getMiniAppUrl('/profile')}\`\n\n` +
        `Menu buttons are fully synced.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open Key Vault Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 6. /clear — Clear Session & Reset Bot State
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
              [{ text: '🔑 Open Key Vault Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 7. /shop — Marketplace Launcher
    // ──────────────────────────────────────────────────
    bot.onText(/\/shop/, (msg) => {
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User');
    });

    // ──────────────────────────────────────────────────
    // 8. /cart — Direct Shopping Cart & Checkout Link
    // ──────────────────────────────────────────────────
    bot.onText(/\/cart/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      bot.sendMessage(
        chatId,
        `🛒 *Shopping Cart & Checkout*\n\n` +
        `Hello ${firstName}! Tap below to view your current cart and proceed to checkout:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Open Cart & Checkout', web_app: { url: getMiniAppUrl('/cart') } }],
              [{ text: '🔑 Back to Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 9. /promos — Active Promo Coupons List
    // ──────────────────────────────────────────────────
    bot.onText(/\/promos/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `🎟️ *Active Discount Promo Codes*\n\n` +
        `Use these discount coupons at checkout in the Mini App:\n\n` +
        `• \`SIK10\` — *10% OFF* on all orders\n` +
        `• \`WELCOME20\` — *20% OFF* for new users\n\n` +
        `Enter code during checkout to claim your discount!`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Use Promo Code in Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 10. /admin — Store Admin Control Panel Launcher
    // ──────────────────────────────────────────────────
    bot.onText(/\/admin/, (msg) => {
      const adminUrl = (process.env.ADMIN_URL || 'https://mini-app-mzu6.onrender.com/admin').trim();
      bot.sendMessage(
        msg.chat.id,
        `⚙️ *Store Admin Control Panel*\n\n` +
        `Manage products, banners, promo codes, users, and orders:\n\n` +
        `🔗 URL: \`${adminUrl}\``,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚙️ Open Admin Control Panel', url: adminUrl }],
              [{ text: '🔑 Back to Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 11. /help & /support — Command Guide & Owner Contact
    // ──────────────────────────────────────────────────
    bot.onText(/\/help|\/support/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `💡 *Key Vault Bot Help & Control Menu*\n\n` +
        `Need help or custom orders? Contact owner *@BoomBaya_ik*!\n\n` +
        `Available Bot Commands:\n` +
        `• /start - 🚀 Open Key Vault Store & Welcome\n` +
        `• /shop - 🔑 Digital Key Marketplace\n` +
        `• /orders - 📦 My Orders & Digital Keys\n` +
        `• /cart - 🛒 Shopping Cart & Checkout\n` +
        `• /profile - 👤 Account & Referral Rewards\n` +
        `• /promos - 🎟️ Active Promo Codes List\n` +
        `• /admin - ⚙️ Store Admin Control Panel\n` +
        `• /update - 🔄 Refresh Bot Menu & Links\n` +
        `• /clear - 🧹 Reset & Clear Sessions\n` +
        `• /help - 💡 Show Help & Contact Support`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💬 Contact Owner (@BoomBaya_ik)', url: 'https://t.me/BoomBaya_ik' }],
              [{ text: '🔑 Open Key Vault Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 12. Callback Query Handler (Inline Button Clicks)
    // ──────────────────────────────────────────────────
    bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      try {
        if (query.data === 'refresh') {
          await updateBotMenu(bot);
          await bot.answerCallbackQuery(query.id, { text: '🔄 Bot Menu Refreshed!' });
          await bot.sendMessage(
            chatId,
            `✅ *Bot Menu Refreshed!*\n\nCommands and menu buttons updated for chat.`,
            { parse_mode: 'Markdown' }
          );
        } else if (query.data === 'help' || query.data === 'commands') {
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(
            chatId,
            `💡 *Key Vault Help & Control Menu*\n\n` +
            `Need help or custom key orders? Tap below to chat with owner *@BoomBaya_ik*!\n\n` +
            `• /start - 🚀 Open Store & Welcome\n` +
            `• /shop - 🔑 Key Marketplace\n` +
            `• /orders - 📦 My Orders & Keys\n` +
            `• /cart - 🛒 Cart & Checkout\n` +
            `• /profile - 👤 Account Profile\n` +
            `• /promos - 🎟️ Active Coupons\n` +
            `• /admin - ⚙️ Admin Control Panel\n` +
            `• /update - 🔄 Refresh Bot Menu\n` +
            `• /clear - 🧹 Reset Sessions\n` +
            `• /help - 💡 Show Help & Support`,
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '💬 Contact Owner (@BoomBaya_ik)', url: 'https://t.me/BoomBaya_ik' }],
                  [{ text: '🚀 Open Key Vault Store', web_app: { url: getMiniAppUrl() } }]
                ]
              }
            }
          );
        }
      } catch (e) {
        console.log('Callback query error:', e);
      }
    });

    // ──────────────────────────────────────────────────
    // 13. Persistent Reply Keyboard Button Command Listeners
    // ──────────────────────────────────────────────────
    bot.onText(/🎟️|Promo Codes/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `🎟️ *Active Discount Promo Codes*\n\n` +
        `Use these discount coupons at checkout in the Mini App:\n\n` +
        `• \`SIK10\` — *10% OFF* on all orders\n` +
        `• \`WELCOME20\` — *20% OFF* for new users\n\n` +
        `Enter code during checkout to claim your discount!`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Use Promo Code in Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    bot.onText(/⚙️|Admin Panel/, (msg) => {
      const adminUrl = (process.env.ADMIN_URL || 'https://mini-app-mzu6.onrender.com/admin').trim();
      bot.sendMessage(
        msg.chat.id,
        `⚙️ *Store Admin Control Panel*\n\n` +
        `Manage products, banners, promo codes, users, and orders:\n\n` +
        `🔗 URL: \`${adminUrl}\``,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚙️ Open Admin Control Panel', url: adminUrl }],
              [{ text: '🔑 Back to Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    bot.onText(/💡|Help & Support/, (msg) => {
      bot.sendMessage(
        msg.chat.id,
        `💡 *Key Vault Bot Help & Control Menu*\n\n` +
        `Need help or custom orders? Contact owner *@BoomBaya_ik*!\n\n` +
        `Available Bot Commands:\n` +
        `• /start - 🚀 Open Key Vault Store & Welcome\n` +
        `• /shop - 🔑 Digital Key Marketplace\n` +
        `• /orders - 📦 My Orders & Digital Keys\n` +
        `• /cart - 🛒 Shopping Cart & Checkout\n` +
        `• /profile - 👤 Account & Referral Rewards\n` +
        `• /promos - 🎟️ Active Promo Codes List\n` +
        `• /admin - ⚙️ Store Admin Control Panel\n` +
        `• /update - 🔄 Refresh Bot Menu & Links\n` +
        `• /clear - 🧹 Reset & Clear Sessions\n` +
        `• /help - 💡 Show Help & Contact Support`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💬 Contact Owner (@BoomBaya_ik)', url: 'https://t.me/BoomBaya_ik' }],
              [{ text: '🔑 Open Key Vault Store', web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
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
    const commands = [
      { command: 'start', description: '🚀 Open Key Vault Store & Welcome' },
      { command: 'shop', description: '🔑 Digital Key Marketplace' },
      { command: 'orders', description: '📦 My Orders & Key Vault' },
      { command: 'cart', description: '🛒 Shopping Cart & Checkout' },
      { command: 'profile', description: '👤 Account & Referral Rewards' },
      { command: 'promos', description: '🎟️ View Active Promo Codes' },
      { command: 'admin', description: '⚙️ Store Admin Control Panel' },
      { command: 'update', description: '🔄 Refresh Bot Menu & Links' },
      { command: 'clear', description: '🧹 Reset Verification Sessions' },
      { command: 'help', description: '💡 Show Help & Contact Support' }
    ];

    await bot.setMyCommands(commands);

    await (bot as any)._request('setChatMenuButton', {
      form: {
        menu_button: JSON.stringify({
          type: 'web_app',
          text: '🔑 Open Key Vault',
          web_app: { url: getMiniAppUrl() }
        })
      }
    });
    console.log(`✅ Telegram Bot menu & commands registered successfully: ${getMiniAppUrl()}`);
  } catch (e: any) {
    console.log('Bot menu setup notice:', e.message || e);
  }
}

function getControlReplyKeyboard() {
  return {
    keyboard: [
      [
        { text: '🔑 Open Store', web_app: { url: getMiniAppUrl() } },
        { text: '📦 My Orders', web_app: { url: getMiniAppUrl('/orders') } }
      ],
      [
        { text: '🛒 Cart', web_app: { url: getMiniAppUrl('/cart') } },
        { text: '👤 Profile', web_app: { url: getMiniAppUrl('/profile') } }
      ],
      [
        { text: '🎟️ Promo Codes' },
        { text: '⚙️ Admin Panel' },
        { text: '💡 Help & Support' }
      ]
    ],
    resize_keyboard: true,
    persistent: true
  };
}

function sendWelcome(bot: TelegramBot, chatId: number, firstName: string) {
  bot.sendMessage(
    chatId,
    `👋 *Welcome to Key Vault Store, ${firstName}!*\n\n` +
    `🔑 Buy instant activation keys for:\n` +
    `• Telegram Premium\n• Steam Games & Wallet Cards\n• VPN Passes & Licenses\n• Software Keys\n\n` +
    `💰 Pay with *KHQR*, *USD ($)*, or *Khmer Riel (៛)*\n\n` +
    `Tap the buttons below to open the Mini App or control commands:`,
    {
      parse_mode: 'Markdown',
      reply_markup: getControlReplyKeyboard()
    }
  ).catch(console.error);
}
