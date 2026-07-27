export const createOrder: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { items, totalAmount, paymentMethod, contactPhone, telegramUserId, telegramChatId } = req.body;
    const orderNumber = "KEY-" + Math.floor(100000 + Math.random() * 900000);
    
    const processedItems: any[] = [];
    const allDeliveredKeysForTelegram: { productName: string; keys: string[] }[] = [];

    for (const item of (items || [])) {
      let deliveredKeys: string[] = [];
      let activationInstructions = "Redeem inside app or software settings.";

      if (item.productId) {
        const dbProduct = await prisma.product.findUnique({ where: { id: Number(item.productId) } });
        if (dbProduct) {
          activationInstructions = dbProduct.description || activationInstructions;
          const availableKeys = dbProduct.digitalKeys || [];
          const neededQty = item.quantity || 1;

          if (availableKeys.length > 0) {
            const takeQty = Math.min(neededQty, availableKeys.length);
            deliveredKeys = availableKeys.slice(0, takeQty);
            const remainingKeys = availableKeys.slice(takeQty);
            const newStock = Math.max(0, (dbProduct.stock || availableKeys.length) - takeQty);

            await prisma.product.update({
              where: { id: dbProduct.id },
              data: {
                digitalKeys: remainingKeys,
                stock: newStock
              }
            }).catch(() => {});
          }
        }
      }

      // Ensure user receives exact requested quantity (e.g. 3 keys for 3 qty)
      const neededQty = item.quantity || 1;
      if (deliveredKeys.length < neededQty) {
        const prefix = (item.productName || "KEY").substring(0, 4).toUpperCase();
        const missingCount = neededQty - deliveredKeys.length;
        const generatedKeys = Array.from({ length: missingCount }, () => generateRandomKey(prefix));
        deliveredKeys = [...deliveredKeys, ...generatedKeys];
      }

      allDeliveredKeysForTelegram.push({
        productName: item.productName || "Digital Key",
        keys: deliveredKeys
      });

      processedItems.push({
        ...item,
        digitalKeys: deliveredKeys,
        activationInstructions
      });
    }

    const newOrder = {
      id: Math.floor(Math.random() * 10000),
      orderNumber,
      totalAmount: totalAmount || 0,
      currency: paymentMethod === 'TON' ? 'TON' : paymentMethod === 'STARS' ? 'STARS' : 'USD',
      paymentMethod: paymentMethod || 'USD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      contactPhone: contactPhone || 'Telegram User',
      createdAt: new Date().toISOString(),
      items: processedItems
    };

    // 🤖 Send Auto-Delivery Message to Customer's Telegram Chat
    const recipientChatId = telegramChatId || telegramUserId;
    if (recipientChatId) {
      let keyDetailsMarkdown = "";
      allDeliveredKeysForTelegram.forEach((kGroup) => {
        keyDetailsMarkdown += `\n📦 *${kGroup.productName}*\n`;
        kGroup.keys.forEach((k) => {
          if (k.startsWith("http://") || k.startsWith("https://")) {
            keyDetailsMarkdown += `🔗 [Click to Open Link](${k})\n\`${k}\`\n`;
          } else {
            keyDetailsMarkdown += `🔑 \`${k}\`\n`;
          }
        });
      });

      const messageText = `🎉 *PAYMENT SUCCESSFUL - KEYS DELIVERED!*

🛍️ *Order Number:* #${orderNumber}
💰 *Total Paid:* $${Number(totalAmount || 0).toFixed(2)} USD

${keyDetailsMarkdown}
📌 *Activation Instructions:*
Redeem keys in app or software settings.

⚡ *Your keys are also permanently saved in your Web App Vault!*`;

      sendTelegramBotNotification(recipientChatId, messageText);
    }

    res.status(201).json({
      success: true,
      message: "Digital keys delivered to Telegram Bot & Vault!",
      data: newOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
