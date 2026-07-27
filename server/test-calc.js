const items = [{ productId: 1, quantity: 1, price: 18 }];

const itemsFormatted = (items || []).map((i) => ({
    name: i.productName || i.name || "Digital Key",
    quantity: String(i.quantity || 1),
    price: Number(i.price || 0).toFixed(2)
}));

let calculatedAmount = 0;
itemsFormatted.forEach((i) => {
    calculatedAmount += Number(i.quantity) * Number(i.price);
});
const amount = calculatedAmount.toFixed(2);

console.log("itemsFormatted:", itemsFormatted);
console.log("amount:", amount);
