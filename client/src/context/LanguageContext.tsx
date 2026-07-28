import React, { createContext, useContext, useState } from "react";

export type Language = "km" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  km: {
    // Header & Bottom Bar
    keyVaultPro: "Digital Keys PRO",
    digitalKeysLicenses: "កូដឌីជីថល & អាជ្ញាប័ណ្ណ",
    navKeys: "ហាងកូដ",
    navCart: "កន្ត្រក",
    navVault: "ទូកូដ", // Keep Khmer translation, or change to គន្លឹះ if requested, but let's just change English part for now. Wait, I'll keep this as is.
    navProfile: "គណនី",

    // Home Page
    searchPlaceholder: "ស្វែងរក Telegram, Steam, VPN, AI...",
    allCategories: "ប្រភេទទាំងអស់",
    featuredItems: "🔥 កូដពេញនិយម",
    newArrivals: "✨ ទំនិញទើបមកដល់",
    onSale: "⚡ បញ្ចុះតម្លៃពិសេស",
    buyNow: "ទិញឥឡូវនេះ",
    addToCart: "បន្ថែមក្នុងកន្ត្រក",
    outOfStock: "អស់ពីស្តុក",
    viewDetails: "មើលលម្អិត",
    instantDelivery: "⚡ ផ្ញើកូដភ្លាមៗតាម Telegram Bot",
    warrantyLabel: "🛡️ ធានាដូរកូដថ្មីជូន",
    digitalKeyCount: "កូដក្នុងស្តុក",

    // Cart Page
    shoppingCart: "🛒 កន្ត្រកទំនិញរបស់អ្នក",
    emptyCart: "កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត",
    browseCatalog: "ទៅកាន់ហាងទំនិញ",
    summary: "សរុបការបញ្ជាទិញ",
    subtotal: "តម្លៃសរុប",
    discount: "បញ្ចុះតម្លៃ",
    totalPay: "តម្លៃត្រូវទូទាត់",
    promoCode: "កូដបញ្ចុះតម្លៃ",
    enterPromo: "បញ្ចូលកូដ (ឧ. SIK10)",
    applyBtn: "ប្រើប្រាស់",
    contactPhone: "លេខទូរស័ព្ទ / Telegram",
    phonePlaceholder: "បញ្ចូលលេខទូរស័ព្ទ...",
    checkoutABA: "ទូទាត់តាម ABA KHQR / ABA PayWay",
    checkoutBakong: "ទូទាត់តាម Bakong KHQR",
    checkoutPaypal: "ទូទាត់តាម PayPal / 💳 Card",
    payNow: "ទូទាត់ប្រាក់ឥឡូវនេះ",

    // Orders / Vault Page
    myKeyVault: "📦 គន្លឹះឌីជីថល & ការទិញរបស់ខ្ញុំ",
    purchasedKeys: "កូដសកម្មភាពដែលបានទិញរួច",
    noOrders: "មិនទាន់មានការទិញនៅឡើយទេ",
    orderId: "លេខបញ្ជាទិញ",
    copyKey: "ចម្លងកូដ",
    copied: "បានចម្លងកូដ!",
    activationGuide: "របៀបប្រើប្រាស់កូដ",

    // Profile Page
    myAccount: "👤 ព័ត៌មានគណនី",
    verifiedStatus: "ស្ថានភាពគណនី: បានផ្ទៀងផ្ទាត់ ✅",
    unverifiedStatus: "ស្ថានភាពគណនី: មិនទាន់ផ្ទៀងផ្ទាត់",
    telegramAuth: "ចូលប្រើតាម Telegram Bot",
    referralProgram: "🎁 កម្មវិធីណែនាំមិត្តភក្តិ (Referral)",
    shareReferral: "ចែករំលែកតំណណែនាំដើម្បីទទួលបានរង្វាន់",
    copyReferral: "ចម្លងតំណណែនាំ",
    logout: "ចាកចេញពីគណនី",

    // Common
    language: "ភាសា",
    languageSettings: "ការកំណត់ភាសា",
    languageSettingsDescription: "ជ្រើសរើសភាសាសម្រាប់មឺនុយ ការទូទាត់ ការបញ្ជាទិញ និងព័ត៌មានគណនី។",
    languageSavedHint: "ជម្រើសនេះនឹងត្រូវបានរក្សាទុកសម្រាប់ការប្រើប្រាស់លើកក្រោយ។",
    languageUpdatedKm: "បានប្តូរទៅភាសាខ្មែរ",
    languageUpdatedEn: "Language changed to English",
    khmer: "ភាសាខ្មែរ",
    english: "English",
    khmerDescription: "ប្រើភាសាខ្មែរសម្រាប់បទពិសោធន៍ក្នុងហាងទាំងមូល។",
    englishDescription: "Use English across the store, checkout, and account pages.",
    selectLanguage: "ជ្រើសរើស",
    selectedLanguage: "កំពុងប្រើ"
  },
  en: {
    // Header & Bottom Bar
    keyVaultPro: "Digital Keys PRO",
    digitalKeysLicenses: "Digital Keys & Licenses",
    navKeys: "Keys",
    navCart: "Cart",
    navVault: "Keys",
    navProfile: "Profile",

    // Home Page
    searchPlaceholder: "Search Telegram, Steam, VPN, AI...",
    allCategories: "All Categories",
    featuredItems: "🔥 Featured Keys",
    newArrivals: "✨ New Arrivals",
    onSale: "⚡ Special Sale",
    buyNow: "Buy Now",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    viewDetails: "View Details",
    instantDelivery: "⚡ Instant Delivery via Telegram Bot",
    warrantyLabel: "🛡️ Replacement Warranty Included",
    digitalKeyCount: "Keys Available",

    // Cart Page
    shoppingCart: "🛒 Your Shopping Cart",
    emptyCart: "Your shopping cart is currently empty",
    browseCatalog: "Browse Key Marketplace",
    summary: "Order Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    totalPay: "Total Amount",
    promoCode: "Promo Code",
    enterPromo: "Enter code (e.g. SIK10)",
    applyBtn: "Apply",
    contactPhone: "Telegram / Phone Number",
    phonePlaceholder: "Enter phone number...",
    checkoutABA: "Pay with ABA KHQR / ABA PayWay",
    checkoutBakong: "Pay with Bakong KHQR",
    checkoutPaypal: "Pay with PayPal / 💳 Card",
    payNow: "Proceed to Payment",

    // Orders / Vault Page
    myKeyVault: "📦 My Digital Keys & Orders",
    purchasedKeys: "Purchased Activation Keys",
    noOrders: "No purchase history found",
    orderId: "Order ID",
    copyKey: "Copy Key",
    copied: "Key Copied!",
    activationGuide: "Activation Instructions",

    // Profile Page
    myAccount: "👤 My Account Profile",
    verifiedStatus: "Status: Account Verified ✅",
    unverifiedStatus: "Status: Unverified Account",
    telegramAuth: "Telegram Bot Verification",
    referralProgram: "🎁 Referral Rewards Program",
    shareReferral: "Share your referral link to earn rewards",
    copyReferral: "Copy Referral Link",
    logout: "Log Out Account",

    // Common
    language: "Language",
    languageSettings: "Language Preferences",
    languageSettingsDescription: "Choose the language used for menus, checkout, orders, and account details.",
    languageSavedHint: "Your preference is saved on this device for the next visit.",
    languageUpdatedKm: "បានប្តូរទៅភាសាខ្មែរ",
    languageUpdatedEn: "Language changed to English",
    khmer: "ភាសាខ្មែរ",
    english: "English",
    khmerDescription: "Use Khmer across the store experience.",
    englishDescription: "Use English across the store, checkout, and account pages.",
    selectLanguage: "Select",
    selectedLanguage: "Selected"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL search query param first (?lang=km or ?lang=en)
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang === "km" || urlLang === "en") {
      return urlLang;
    }
    const saved = localStorage.getItem("mini_app_language");
    return (saved === "en" || saved === "km") ? saved : "km"; // Default to Khmer
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mini_app_language", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "km" ? "en" : "km");
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
