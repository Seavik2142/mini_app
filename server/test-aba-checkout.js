const crypto = require('crypto');
const merchantId = "ec477129";
const publicKey = "78445715560c048d3e0db4ced5167311a5817dfa";
const apiUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/checkout"; // CHECKOUT URL!

async function testCheckout() {
    const now = new Date();
    const req_time = `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}${String(now.getUTCHours()).padStart(2,'0')}${String(now.getUTCMinutes()).padStart(2,'0')}${String(now.getUTCSeconds()).padStart(2,'0')}`;
    const tran_id = `TR${Date.now()}`;
    const amount = "18.00";
    const items = "";
    const shipping = "";
    const firstname = "Test";
    const lastname = "User";
    const email = "test@test.com";
    const phone = "012345678";
    const type = "purchase";
    const payment_option = "cards";
    const return_url = "https://test.com";
    const continue_success_url = "https://test.com";
    const currency = "USD";

    const rawData = `${req_time}${merchantId}${tran_id}${amount}${items}${shipping}${firstname}${lastname}${email}${phone}${type}${payment_option}${continue_success_url}${return_url}${currency}`;
    const hash = crypto.createHmac("sha512", publicKey).update(rawData).digest("base64");

    const form = new FormData();
    form.append("req_time", req_time);
    form.append("merchant_id", merchantId);
    form.append("tran_id", tran_id);
    form.append("amount", amount);
    form.append("firstname", firstname);
    form.append("lastname", lastname);
    form.append("email", email);
    form.append("phone", phone);
    form.append("type", type);
    form.append("payment_option", payment_option);
    form.append("return_url", return_url);
    form.append("continue_success_url", continue_success_url);
    form.append("hash", hash);
    form.append("currency", currency);

    try {
        const res = await fetch(apiUrl, { method: "POST", body: form });
        const text = await res.text();
        console.log(`Checkout Endpoint ->`, text.substring(0, 200));
    } catch (e) {
        console.log(`Checkout Endpoint -> ERROR`);
    }
}

testCheckout();
