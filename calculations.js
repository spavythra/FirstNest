/* ── Pure calculation helpers (no DOM) ───────────────────── */
/* Split out from script.js so this logic can be unit tested
   without loading the DOM-dependent parts of the app. */

function calculateAffordablePrice(values) {
  const maxHousingShare = 0.35;
  const monthlyBudget = Math.max(values.income * maxHousingShare - values.debt, 0);
  const monthlyRate = values.rate / 100 / 12;
  const months = values.years * 12;

  if (monthlyRate <= 0 || months <= 0) {
    return { principal: 0, propertyPrice: values.savings, monthlyBudget };
  }

  const principal =
    monthlyBudget * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
  const propertyPrice = principal + values.savings;

  return { principal, propertyPrice, monthlyBudget };
}

function getPricePerSqm(listing) {
  if (typeof listing.pricePerSqm === "number" && listing.pricePerSqm > 0) {
    return Math.round(listing.pricePerSqm);
  }
  return listing.size > 0 ? Math.round(listing.price / listing.size) : 0;
}

function sortListings(list, method) {
  const copy = [...list];
  switch (method) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "size-desc":
      return copy.sort((a, b) => b.size - a.size);
    case "score-desc":
      return copy.sort((a, b) => b.areaScore - a.areaScore);
    default:
      return copy;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { calculateAffordablePrice, getPricePerSqm, sortListings };
}
