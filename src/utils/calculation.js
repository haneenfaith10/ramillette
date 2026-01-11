//   function to calculate the total price per item with the discount,price and the quantity
export function calculateTotalPrice(price, discount, quantity) {
  const discountedPrice = price - (price * discount) / 100;
  return discountedPrice * quantity;
}

export function calculateCartSubtotal(cartItems, countryId) {
  if (!countryId) {
    console.warn("countryId is missing");
    return 0;
  }

  return cartItems.reduce((subtotal, item) => {
    const variants = item.productId.countryVariants?.[countryId] || [];

    if (!variants.length) return subtotal;

    // Use the first variant's price (or customize as needed)
    const basePrice = Number(variants[0].price || 0);
    const discountPercent = Number(item.productId.productDiscount || 0);
    const discountedPrice = basePrice - (basePrice * discountPercent) / 100;

    const itemTotal = discountedPrice * item.qty;
    return subtotal + itemTotal;
  }, 0);
}

// function to calculate the actual price
export function getDiscountedPrice(amount, discountPercent) {
  const discountAmount = (discountPercent / 100) * amount;
  const finalPrice = amount - discountAmount;
  return finalPrice;
}

// function to get the tax amount
export function calculateTotalPriceWithTax(price, taxPercentage) {
  const taxAmount = (price * taxPercentage) / 100;
  const totalPrice = price + taxAmount;
  return {
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
}
