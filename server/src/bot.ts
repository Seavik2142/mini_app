/**
 * Telegram Bot — OTP & Mini App Management Bot (Bilingual: Khmer 🇰🇭 / English 🇬🇧)
 *
 * Commands:
 *   /start    - Welcome & Launch Mini App
 *   /language - Change Bot Language (Khmer / English)
 *   /shop     - Open Key Vault Marketplace
 *   /orders   - View Purchases & Key Vault
 *   /cart     - Open Shopping Cart & Checkout
 *   /profile  - View Account Profile & Rewards
 *   /promos   - View Active Promo Discount Codes
 *   /admin    - Open Store Admin Control Panel
 *   /update   - Refresh Bot Configuration & Links
 *   /clear    - Reset Active OTP Verification Sessions
 *   /help     - Show Command Guide & Support Link
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import {
  getSession,
  attachTelegramUser,
  getSecondsUntilExpiry,
} from './utils/otpStore';
import { prisma } from './index';

dotenv.config();

const token = process.env.BOT_TOKEN!;
const BOT_USERNAME = 'Sik_mybot';

// ── Per-User Language Memory Store (default: 'km') ─────────────────
const userLanguages: Record<number, 'en' | 'km'> = {};

export const getUserLanguage = (chatId: number): 'en' | 'km' => {
  return userLanguages[chatId] || 'km'; // Default to Khmer
};

export const setUserLanguage = (chatId: number, lang: 'en' | 'km') => {
  userLanguages[chatId] = lang;
};

// ── Complete Bilingual Translation Dictionary ───────────────────────
const i18n = {
  en: {
    welcomeTitle: (name: string) => `👋 *Welcome to Key Vault Store, ${name}!*`,
    welcomeBody:
      `🔑 Buy instant activation keys for:\n` +
      `• Telegram Premium\n• Steam Games & Wallet Cards\n• VPN Passes & Licenses\n• Software Keys\n\n` +
      `💰 Pay with *KHQR*, *USD ($)*, or *Khmer Riel (៛)*\n\n` +
      `Tap the buttons below to open the Mini App or control commands:`,
    btnOpenStore: '🔑 Open Store',
    btnOrders: '📦 My Orders',
    btnCart: '🛒 Cart',
    btnProfile: '👤 Profile',
    btnPromos: '🎟️ Promo Codes',
    btnAdmin: '⚙️ Admin Panel',
    btnLanguage: '🌐 Language / ភាសា',
    btnHelp: '💡 Help & Support',
    btnContactOwner: '💬 Contact Owner (@BoomBaya_ik)',

    otpSent: (name: string, otp: string, min: number, sec: number) =>
      `🔐 *Your Mini App Verification Code*\n\n` +
      `Hello *${name}*! Here is your 6-digit verification code:\n\n` +
      `\`${otp}\`\n\n` +
      `⏳ Valid for *${min}m ${sec}s*\n` +
      `🔒 Do not share this code with anyone.`,
    btnVerifyInApp: '↩️ Open Mini App to Verify',
    otpExpired: `⚠️ *This verification link has expired or is invalid.*\n\nPlease go back to the Mini App and request a new code.`,

    ordersTitle: (name: string) => `📦 *My Orders & Digital Key Vault*\n\nHello ${name}! Tap below to view your purchased activation keys:`,
    btnViewOrders: '📦 View My Orders & Keys',
    btnBackToStore: '🔑 Back to Store',

    profileTitle: (name: string) => `👤 *My Account Profile*\n\nHello ${name}! Tap below to manage your account and referral link:`,
    btnViewProfile: '👤 Open Profile & Rewards',

    cartTitle: (name: string) => `🛒 *Shopping Cart & Checkout*\n\nHello ${name}! Tap below to view your current cart and proceed to checkout:`,
    btnViewCart: '🛒 Open Cart & Checkout',

    promosTitle: `🎟️ *Active Discount Promo Codes*\n\nUse these discount coupons at checkout in the Mini App:\n\n• \`SIK10\` — *10% OFF* on all orders\n• \`WELCOME20\` — *20% OFF* for new users\n\nEnter code during checkout to claim your discount!`,
    btnUsePromo: '🛒 Use Promo Code in Store',

    adminTitle: (url: string) => `⚙️ *Store Admin Control Panel*\n\nManage products, banners, promo codes, users, and orders:\n\n🔗 URL: \`${url}\``,
    btnOpenAdmin: '⚙️ Open Admin Control Panel',

    clearTitle: (name: string) => `🧹 *Session Cleared & Reset!*\n\nHello ${name}, your active verification sessions have been cleared.\n\nIf you need to log in again, request a new code from the Mini App.`,

    updateTitle: (name: string, base: string, orders: string, profile: string) =>
      `🔄 *Bot Configuration & Links Refreshed!*\n\nHello ${name}, all links and menu buttons have been updated:\n\n• Base URL: \`${base}\`\n• Orders URL: \`${orders}\`\n• Profile URL: \`${profile}\`\n\nMenu buttons are fully synced.`,

    helpTitle: `💡 *Key Vault Bot Help & Control Menu*\n\nNeed help or custom orders? Contact owner *@BoomBaya_ik*!\n\nAvailable Bot Commands:\n• /start - 🚀 Open Key Vault Store & Welcome\n• /language - 🌐 Change Language (Khmer / English)\n• /shop - 🔑 Digital Key Marketplace\n• /orders - 📦 My Orders & Digital Keys\n• /cart - 🛒 Shopping Cart & Checkout\n• /profile - 👤 Account & Referral Rewards\n• /promos - 🎟️ Active Promo Codes List\n• /admin - ⚙️ Store Admin Control Panel\n• /update - 🔄 Refresh Bot Menu & Links\n• /clear - 🧹 Reset Verification Sessions\n• /help - 💡 Show Help & Contact Support`,

    langSelector: `🌐 *Select Language / ជ្រើសរើសភាសា*\n\nPlease choose your preferred language for the Telegram Bot:`,
    langChanged: `✅ *Language changed to English 🇬🇧!*\n\nAll bot text and keyboard controls are now set to English.`
  },
  km: {
    welcomeTitle: (name: string) => `👋 *សូមស្វាគមន៍មកកាន់ Key Vault Store, ${name}!*`,
    welcomeBody:
      `🔑 ទិញកូដសកម្មភាពភ្លាមៗសម្រាប់:\n` +
      `• Telegram Premium\n• កាតហ្គេម Steam & Wallet Cards\n• កូដ VPN & អាជ្ញាប័ណ្ណ\n• កូដកម្មវិធីផ្សេងៗ\n\n` +
      `💰 ទូទាត់តាម *KHQR*, *ដុល្លារ ($)* ឬ *ប្រាក់រៀល (៛)*\n\n` +
      `ចុចប៊ូតុងខាងក្រោមដើម្បីបើក Mini App ឬបញ្ជាប៊ូតុង:`,
    btnOpenStore: '🔑 បើកហាង (Store)',
    btnOrders: '📦 ការទិញរបស់ខ្ញុំ (Orders)',
    btnCart: '🛒 កន្ត្រកទំនិញ (Cart)',
    btnProfile: '👤 គណនី (Profile)',
    btnPromos: '🎟️ កូដបញ្ចុះតម្លៃ',
    btnAdmin: '⚙️ ផ្ទាំងគ្រប់គ្រង Admin',
    btnLanguage: '🌐 ភាសា / Language',
    btnHelp: '💡 ជំនួយ (Help)',
    btnContactOwner: '💬 ទំនាក់ទំនងម្ចាស់ហាង (@BoomBaya_ik)',

    otpSent: (name: string, otp: string, min: number, sec: number) =>
      `🔐 *កូដផ្ទៀងផ្ទាត់ Mini App របស់អ្នក*\n\n` +
      `សួស្តី *${name}*! នេះជាកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់របស់អ្នក:\n\n` +
      `\`${otp}\`\n\n` +
      `⏳ មានសុពលភាពរយៈពេល *${min}នាទី ${sec}វិនាទី*\n` +
      `🔒 សូមកុំចែករំលែកកូដនេះទៅកាន់អ្នកផ្សេង។`,
    btnVerifyInApp: '↩️ បើក Mini App ដើម្បីផ្ទៀងផ្ទាត់',
    otpExpired: `⚠️ *តំណផ្ទៀងផ្ទាត់នេះបានផុតកំណត់ ឬមិនត្រឹមត្រូវ។*\n\nសូមត្រឡប់ទៅកាន់ Mini App ហើយស្នើសុំកូដថ្មី។`,

    ordersTitle: (name: string) => `📦 *ការទិញរបស់ខ្ញុំ & Key Vault*\n\nសួស្តី ${name}! ចុចខាងក្រោមដើម្បីមើលកូដដែលអ្នកបានទិញ:`,
    btnViewOrders: '📦 មើលការទិញរបស់ខ្ញុំ',
    btnBackToStore: '🔑 ត្រឡប់ទៅហាងវិញ',

    profileTitle: (name: string) => `👤 *ព័ត៌មានគណនីរបស់ខ្ញុំ*\n\nសួស្តី ${name}! ចុចខាងក្រោមដើម្បីគ្រប់គ្រងគណនី និងតំណណែនាំ:`,
    btnViewProfile: '👤 បើកមើលគណនី & ភាគរយ',

    cartTitle: (name: string) => `🛒 *កន្ត្រកទំនិញ & ការទូទាត់*\n\nសួស្តី ${name}! ចុចខាងក្រោមដើម្បីមើលកន្ត្រកទំនិញ និងទូទាត់ប្រាក់:`,
    btnViewCart: '🛒 បើកកន្ត្រកទំនិញ & ទូទាត់',

    promosTitle: `🎟️ *កូដបញ្ចុះតម្លៃពិសេស (Promo Codes)*\n\nសូមប្រើប្រាស់កូដបញ្ចុះតម្លៃខាងក្រោមពេលទូទាត់ប្រាក់ក្នុង Mini App:\n\n• \`SIK10\` — *បញ្ចុះតម្លៃ 10%* លើគ្រប់ការបញ្ជាទិញ\n• \`WELCOME20\` — *បញ្ចុះតម្លៃ 20%* សម្រាប់អ្នកប្រើប្រាស់ថ្មី\n\nបញ្ចូលកូដពេលទូទាត់ប្រាក់ដើម្បីទទួលបានការបញ្ចុះតម្លៃ!`,
    btnUsePromo: '🛒 បើកហាងទិញទំនិញ',

    adminTitle: (url: string) => `⚙️ *ផ្ទាំងគ្រប់គ្រង Admin*\n\nគ្រប់គ្រងទំនិញ បដា កូដបញ្ចុះតម្លៃ អ្នកប្រើប្រាស់ និងការបញ្ជាទិញ:\n\n🔗 URL: \`${url}\``,
    btnOpenAdmin: '⚙️ បើកផ្ទាំងគ្រប់គ្រង Admin',

    clearTitle: (name: string) => `🧹 *បានលុប Session រួចរាល់!*\n\nសួស្តី ${name}, សេសសិនផ្ទៀងផ្ទាត់របស់អ្នកត្រូវបានលុបសំអាត។\n\nប្រសិនបើអ្នកត្រូវការចូលប្រើម្តងទៀត សូមស្នើសុំកូដថ្មីពី Mini App។`,

    updateTitle: (name: string, base: string, orders: string, profile: string) =>
      `🔄 *បានធ្វើបច្ចុប្បន្នភាពមឺនុយ & តំណភ្ជាប់!*\n\nសួស្តី ${name}, តំណភ្ជាប់ និងប៊ូតុងមឺនុយត្រូវបានធ្វើបច្ចុប្បន្នភាពរួចរាល់:\n\n• Base URL: \`${base}\`\n• Orders URL: \`${orders}\`\n• Profile URL: \`${profile}\`\n\nប៊ូតុងមឺនុយត្រូវបានធ្វើសមកាលកម្មពេញលេញ។`,

    helpTitle: `💡 *មគ្គុទ្ទេសក៍ជំនួយ & គាំទ្រ Key Vault*\n\nត្រូវការជំនួយ ឬកុម្ម៉ង់កូដពិសេស? ទំនាក់ទំនងម្ចាស់ហាង *@BoomBaya_ik*!\n\nបញ្ជីពាក្យបញ្ជាដែលមាន:\n• /start - 🚀 បើកហាង & ស្វាគមន៍\n• /language - 🌐 ផ្លាស់ប្តូរភាសា (Khmer / English)\n• /shop - 🔑 ហាងទំនិញកូដឌីជីថល\n• /orders - 📦 ការទិញរបស់ខ្ញុំ\n• /cart - 🛒 កន្ត្រកទំនិញ & ទូទាត់ប្រាក់\n• /profile - 👤 គណនី & ភាគរយណែនាំ\n• /promos - 🎟️ កូដបញ្ចុះតម្លៃ\n• /admin - ⚙️ ផ្ទាំងគ្រប់គ្រង Admin\n• /update - 🔄 ធ្វើបច្ចុប្បន្នភាពមឺនុយ\n• /clear - 🧹 លុបសេសសិន\n• /help - 💡 ជំនួយ & ទំនាក់ទំនង`,

    langSelector: `🌐 *ជ្រើសរើសភាសា / Select Language*\n\nសូមជ្រើសរើសភាសាដែលអ្នកចង់ប្រើប្រាស់ក្នុង Telegram Bot:`,
    langChanged: `✅ *ភាសាត្រូវ​បានផ្លាស់ប្តូរទៅជា ភាសាខ្មែរ 🇰🇭!*\n\nអត្ថបទសារ និងក្តារចុចបញ្ជាទាំងអស់ក្នុង Bot ត្រូវបានផ្លាស់ប្តូរមកជា ភាសាខ្មែរ។`
  }
};

// Helper to construct exact, clean Mini App URLs for subpages (/app, /app/orders, /app/profile)
export const getMiniAppUrl = (path: string = ''): string => {
  let baseUrl = (process.env.MINI_APP_URL || 'https://mgdigitalkeys.store').trim();
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  if (!baseUrl.endsWith('/app')) {
    baseUrl = `${baseUrl}`;
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
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      if (!sessionId) {
        return sendWelcome(bot, chatId, firstName, msg.from);
      }

      const session = getSession(sessionId);

      if (!session) {
        await bot.sendMessage(
          chatId,
          t.otpExpired,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }
              ]]
            }
          }
        );
        return;
      }

      // Attach user's chatId and real Telegram identity (including profile photo) to session
      if (msg.from) {
        let photoUrl: string | undefined = undefined;
        try {
          const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
          if (photos && photos.total_count > 0 && photos.photos[0]?.length > 0) {
            const fileId = photos.photos[0][0].file_id;
            photoUrl = await bot.getFileLink(fileId);
          }
        } catch (err) {
          console.log("Profile photo fetch notification:", err);
        }

        attachTelegramUser(sessionId, chatId, {
          id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          photo_url: photoUrl
        } as any);
      }

      const expiresIn = getSecondsUntilExpiry(sessionId);
      const minutes = Math.floor(expiresIn / 60);
      const seconds = expiresIn % 60;

      // Send the 6-digit OTP code in user's language
      await bot.sendMessage(
        chatId,
        t.otpSent(firstName, session.otp, minutes, seconds),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: t.btnVerifyInApp, web_app: { url: getMiniAppUrl() } }
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
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User', msg.from);
    });

    // ──────────────────────────────────────────────────
    // 3. /orders — Direct Orders & Vault Link
    // ──────────────────────────────────────────────────
    bot.onText(/\/orders/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      bot.sendMessage(
        chatId,
        t.ordersTitle(firstName),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnViewOrders, web_app: { url: getMiniAppUrl('/orders') } }],
              [{ text: t.btnBackToStore, web_app: { url: getMiniAppUrl() } }]
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
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      bot.sendMessage(
        chatId,
        t.profileTitle(firstName),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnViewProfile, web_app: { url: getMiniAppUrl('/profile') } }],
              [{ text: t.btnBackToStore, web_app: { url: getMiniAppUrl() } }]
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
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      await updateBotMenu(bot);

      await bot.sendMessage(
        chatId,
        t.updateTitle(firstName, getMiniAppUrl(), getMiniAppUrl('/orders'), getMiniAppUrl('/profile')),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }]
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
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      await bot.sendMessage(
        chatId,
        t.clearTitle(firstName),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 7. /shop — Marketplace Launcher
    // ──────────────────────────────────────────────────
    bot.onText(/\/shop/, (msg) => {
      sendWelcome(bot, msg.chat.id, msg.from?.first_name || 'User', msg.from);
    });

    // ──────────────────────────────────────────────────
    // 8. /cart — Direct Shopping Cart & Checkout Link
    // ──────────────────────────────────────────────────
    bot.onText(/\/cart/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'User';
      const lang = getUserLanguage(chatId);
      const t = i18n[lang];

      bot.sendMessage(
        chatId,
        t.cartTitle(firstName),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnViewCart, web_app: { url: getMiniAppUrl('/cart') } }],
              [{ text: t.btnBackToStore, web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 9. /promos — Active Promo Coupons List
    // ──────────────────────────────────────────────────
    bot.onText(/\/promos/, (msg) => {
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];

      bot.sendMessage(
        msg.chat.id,
        t.promosTitle,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnUsePromo, web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 10. /admin — Store Admin Control Panel Launcher
    // ──────────────────────────────────────────────────
    bot.onText(/\/admin/, (msg) => {
      const adminUrl = (process.env.ADMIN_URL || 'https://mini-app-2z1.pages.dev/admin').trim();
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];

      bot.sendMessage(
        msg.chat.id,
        t.adminTitle(adminUrl),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnOpenAdmin, url: adminUrl }],
              [{ text: t.btnBackToStore, web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 11. /help & /support — Command Guide & Owner Contact
    // ──────────────────────────────────────────────────
    bot.onText(/\/help|\/support/, (msg) => {
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];

      bot.sendMessage(
        msg.chat.id,
        t.helpTitle,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.btnContactOwner, url: 'https://t.me/BoomBaya_ik' }],
              [{ text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }]
            ]
          }
        }
      );
    });

    // ──────────────────────────────────────────────────
    // 12. /language & 🌐 Language Selector Handler
    // ──────────────────────────────────────────────────
    bot.onText(/\/language|🌐|ភាសា|Language/, (msg) => {
      sendLanguageSelector(bot, msg.chat.id);
    });

    // ──────────────────────────────────────────────────
    // 13. Persistent Reply Keyboard Button Command Listeners
    // ──────────────────────────────────────────────────
    bot.onText(/🎟️|Promo Codes|កូដបញ្ចុះតម្លៃ/, (msg) => {
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];
      bot.sendMessage(msg.chat.id, t.promosTitle, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t.btnUsePromo, web_app: { url: getMiniAppUrl() } }]] }
      });
    });

    bot.onText(/⚙️|Admin Panel|ផ្ទាំងគ្រប់គ្រង/, (msg) => {
      const adminUrl = (process.env.ADMIN_URL || 'https://mini-app-2z1.pages.dev/admin').trim();
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];
      bot.sendMessage(msg.chat.id, t.adminTitle(adminUrl), {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t.btnOpenAdmin, url: adminUrl }], [{ text: t.btnBackToStore, web_app: { url: getMiniAppUrl() } }]] }
      });
    });

    bot.onText(/💡|Help & Support|ជំនួយ/, (msg) => {
      const lang = getUserLanguage(msg.chat.id);
      const t = i18n[lang];
      bot.sendMessage(msg.chat.id, t.helpTitle, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [[{ text: t.btnContactOwner, url: 'https://t.me/BoomBaya_ik' }], [{ text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }]] }
      });
    });

    // ──────────────────────────────────────────────────
    // Telegram Authentic Contact Handler (Real Phone Sync)
    // ──────────────────────────────────────────────────
    bot.on('contact', async (msg) => {
      const chatId = msg.chat.id;
      const contact = msg.contact;
      if (!contact || !contact.phone_number) return;

      const rawPhone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
      const name = `${contact.first_name || msg.from?.first_name || 'User'} ${contact.last_name || msg.from?.last_name || ''}`.trim();
      const username = msg.from?.username || null;
      const tgId = String(msg.from?.id || chatId);

      try {
        await prisma.user.upsert({
          where: { tgId },
          update: { phone: rawPhone, name, username },
          create: {
            tgId,
            name,
            username,
            phone: rawPhone,
            referCode: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            balance: 0
          }
        });

        const lang = getUserLanguage(chatId);
        const successMsg = lang === 'km' 
          ? `✅ *លេខទូរស័ព្ទពិតប្រាកដរបស់អ្នក (${rawPhone}) ត្រូវបានតភ្ជាប់ជាមួយ Telegram រួចរាល់!*`
          : `✅ *Your authentic Telegram phone number (${rawPhone}) is now connected!*`;

        bot.sendMessage(chatId, successMsg, {
          parse_mode: 'Markdown',
          reply_markup: getControlReplyKeyboard(chatId)
        });
      } catch (err) {
        console.error("Error saving Telegram contact:", err);
      }
    });

    // ──────────────────────────────────────────────────
    // 14. Callback Query Handler (Inline Button Clicks)
    // ──────────────────────────────────────────────────
    bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId) return;

      try {
        if (query.data === 'lang_en') {
          setUserLanguage(chatId, 'en');
          await bot.answerCallbackQuery(query.id, { text: 'Language set to English 🇬🇧' });
          await bot.sendMessage(
            chatId,
            i18n.en.langChanged,
            { parse_mode: 'Markdown', reply_markup: getControlReplyKeyboard(chatId) }
          );
        } else if (query.data === 'lang_km') {
          setUserLanguage(chatId, 'km');
          await bot.answerCallbackQuery(query.id, { text: 'ភាសាត្រូវ​បានផ្លាស់ប្តូរទៅជា ភាសាខ្មែរ 🇰🇭' });
          await bot.sendMessage(
            chatId,
            i18n.km.langChanged,
            { parse_mode: 'Markdown', reply_markup: getControlReplyKeyboard(chatId) }
          );
        } else if (query.data === 'refresh') {
          await updateBotMenu(bot);
          await bot.answerCallbackQuery(query.id, { text: '🔄 Bot Menu Refreshed!' });
          await bot.sendMessage(
            chatId,
            `✅ *Bot Menu Refreshed!*`,
            { parse_mode: 'Markdown' }
          );
        } else if (query.data === 'help' || query.data === 'commands') {
          await bot.answerCallbackQuery(query.id);
          const lang = getUserLanguage(chatId);
          const t = i18n[lang];
          await bot.sendMessage(chatId, t.helpTitle, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: t.btnContactOwner, url: 'https://t.me/BoomBaya_ik' }],
                [{ text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } }]
              ]
            }
          });
        }
      } catch (e) {
        console.log('Callback query error:', e);
      }
    });

    // Register Menu Commands & Button
    updateBotMenu(bot);

    return bot;
  } catch (error) {
    console.error('Failed to initialize Telegram Bot:', error);
    return null;
  }
};

function sendLanguageSelector(bot: TelegramBot, chatId: number) {
  const lang = getUserLanguage(chatId);
  const t = i18n[lang];

  bot.sendMessage(chatId, t.langSelector, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇰🇭 ភាសាខ្មែរ (Khmer)', callback_data: 'lang_km' },
          { text: '🇬🇧 English', callback_data: 'lang_en' }
        ]
      ]
    }
  }).catch(console.error);
}

async function updateBotMenu(bot: TelegramBot) {
  try {
    const commands = [
      { command: 'start', description: '🚀 Open Key Vault Store & Welcome' },
      { command: 'language', description: '🌐 Change Language / ផ្លាស់ប្តូរភាសា' },
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

function getControlReplyKeyboard(chatId?: number) {
  const lang = chatId ? getUserLanguage(chatId) : 'km';
  const t = i18n[lang];

  return {
    keyboard: [
      [
        { text: t.btnOpenStore, web_app: { url: getMiniAppUrl() } },
        { text: t.btnOrders, web_app: { url: getMiniAppUrl('/orders') } }
      ],
      [
        { text: t.btnCart, web_app: { url: getMiniAppUrl('/cart') } },
        { text: t.btnProfile, web_app: { url: getMiniAppUrl('/profile') } }
      ],
      [
        { text: t.btnPromos },
        { text: t.btnLanguage },
        { text: t.btnHelp }
      ]
    ],
    resize_keyboard: true,
    persistent: true
  };
}

async function sendWelcome(bot: TelegramBot, chatId: number, firstName: string, tgUser?: any) {
  const lang = getUserLanguage(chatId);
  const t = i18n[lang];

  if (tgUser) {
    try {
      const tgId = String(tgUser.id || chatId);
      const name = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || 'User';
      const username = tgUser.username || null;
      await prisma.user.upsert({
        where: { tgId },
        update: { name, username, lastSeenAt: new Date() },
        create: {
          tgId,
          name,
          username,
          referCode: 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          referBy: "0",
          balance: 0,
        }
      });
    } catch (e) {
      console.error("Bot auto-register error:", e);
    }
  }

  bot.sendMessage(
    chatId,
    `${t.welcomeTitle(firstName)}\n\n${t.welcomeBody}`,
    {
      parse_mode: 'Markdown',
      reply_markup: getControlReplyKeyboard(chatId)
    }
  ).catch(console.error);
}

let isBroadcasting = false;

export async function sendBroadcastNews(payload: {
  title: string;
  message: string;
  imageUrl?: string;
  btnText?: string;
  btnUrl?: string;
}) {
  if (isBroadcasting) {
    throw new Error("A broadcast is currently in progress. Please wait until it finishes before starting another.");
  }
  isBroadcasting = true;

  try {
    const token = process.env.BOT_TOKEN || '8833845544:AAGTuW9rZQHH9XLBsjSM3weWtFrwWtP2g94';
    const channelTarget = (process.env.CHANNEL_ID || process.env.CHANNEL_USERNAME || process.env.TELEGRAM_CHANNEL_USERNAME || '@MGDigitalKeys').trim();

    const users = await prisma.user.findMany({
      where: { isDelete: false },
      select: { tgId: true }
    });

    const userChatIds = new Set<string>();
    users.forEach(u => {
      if (u.tgId && u.tgId.trim() && u.tgId.trim() !== channelTarget) {
        userChatIds.add(u.tgId.trim());
      }
    });

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    const formattedText = `📢 *${payload.title.trim()}*\n\n${payload.message.trim()}`;
    const buttonUrl = payload.btnUrl?.trim() || getMiniAppUrl();
    const buttonText = payload.btnText?.trim() || '🚀 Open Key Vault Store';

    const sendToChat = async (chatId: string) => {
      const isChannel = chatId.startsWith('@') || chatId.startsWith('-100') || chatId.startsWith('-');
      const replyMarkup = buttonUrl
        ? {
            inline_keyboard: [[
              {
                text: buttonText,
                ...(isChannel ? { url: buttonUrl } : { web_app: { url: buttonUrl } })
              }
            ]]
          }
        : undefined;

      const rawImg = (payload.imageUrl || '').trim();
      if (rawImg.startsWith('http')) {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: rawImg,
            caption: formattedText,
            parse_mode: 'Markdown',
            ...(replyMarkup ? { reply_markup: replyMarkup } : {})
          })
        });
        return await res.json();
      } else if (rawImg.startsWith('data:image')) {
        const base64Data = rawImg.split(',')[1];
        const mimeMatch = rawImg.match(/data:(image\/\w+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const buffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', new Blob([buffer], { type: mimeType }), 'news.png');
        formData.append('caption', formattedText);
        formData.append('parse_mode', 'Markdown');
        if (replyMarkup) formData.append('reply_markup', JSON.stringify(replyMarkup));

        const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          body: formData
        });
        return await res.json();
      } else {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedText,
            parse_mode: 'Markdown',
            ...(replyMarkup ? { reply_markup: replyMarkup } : {})
          })
        });
        return await res.json();
      }
    };

    // 1. Send synchronously to channel first to ensure immediate delivery & check valid syntax/image
    if (channelTarget) {
      try {
        const data = await sendToChat(channelTarget);
        if (data.ok) {
          successCount++;
        } else {
          failCount++;
          const errDesc = data.description || 'Unknown Telegram error';
          errors.push(`${channelTarget}: ${errDesc}`);
          console.error(`Broadcast failed for channel ${channelTarget}`, data);
          isBroadcasting = false;
          throw new Error(`Failed to broadcast to channel (${channelTarget}): ${errDesc}`);
        }
      } catch (err: any) {
        isBroadcasting = false;
        throw new Error(err.message || `Failed to send broadcast to channel: ${err}`);
      }
    }

    const totalTarget = (channelTarget ? 1 : 0) + userChatIds.size;

    // 2. Deliver to individual users asynchronously in the background without blocking the HTTP request
    setTimeout(async () => {
      try {
        for (const chatId of userChatIds) {
          try {
            const data = await sendToChat(chatId);
            if (data.ok) successCount++;
            else {
              failCount++;
              errors.push(`${chatId}: ${data.description || 'Unknown error'}`);
            }
          } catch (err) {
            failCount++;
            errors.push(`${chatId}: ${(err as Error).message}`);
          }
          // Small pause to prevent Telegram API 429 rate limit errors (~30 msgs/sec limit)
          await new Promise(r => setTimeout(r, 50));
        }
        console.log(`Background broadcast completed. Success: ${successCount}, Failed: ${failCount}, Total: ${totalTarget}`);
      } catch (err) {
        console.error("Error in background broadcast user loop:", err);
      } finally {
        isBroadcasting = false;
      }
    }, 0);

    return { 
      successCount, 
      failCount, 
      totalTarget, 
      errors,
      message: channelTarget
        ? `📢 Broadcast sent immediately to ${channelTarget}! Delivering to ${userChatIds.size} users in background.`
        : `📢 Broadcast delivery started in background for ${userChatIds.size} users.`
    };
  } catch (err) {
    isBroadcasting = false;
    throw err;
  }
}
