const { calculateAffordablePrice, getPricePerSqm, sortListings } = require("./calculations");

describe("calculateAffordablePrice", () => {
  test("spreads monthly budget across the loan term at the given rate", () => {
    const result = calculateAffordablePrice({
      income: 4000,
      debt: 200,
      rate: 3.5,
      years: 25,
      savings: 20000,
    });

    expect(result.monthlyBudget).toBeCloseTo(1200, 5);
    expect(result.principal).toBeGreaterThan(0);
    expect(result.propertyPrice).toBeCloseTo(result.principal + 20000, 5);
  });

  test("housing budget never goes negative when debt exceeds the housing share", () => {
    const result = calculateAffordablePrice({
      income: 2000,
      debt: 5000,
      rate: 3.5,
      years: 25,
      savings: 10000,
    });

    expect(result.monthlyBudget).toBe(0);
  });

  test("falls back to savings as the property price when rate or term is zero", () => {
    const result = calculateAffordablePrice({
      income: 4000,
      debt: 0,
      rate: 0,
      years: 25,
      savings: 15000,
    });

    expect(result).toEqual({ principal: 0, propertyPrice: 15000, monthlyBudget: 1400 });
  });
});

describe("getPricePerSqm", () => {
  test("uses the listing's own pricePerSqm when present and positive", () => {
    expect(getPricePerSqm({ pricePerSqm: 4123.6, price: 999999, size: 1 })).toBe(4124);
  });

  test("derives price per square metre from price and size otherwise", () => {
    expect(getPricePerSqm({ price: 300000, size: 75 })).toBe(4000);
  });

  test("returns 0 when size is missing or zero", () => {
    expect(getPricePerSqm({ price: 300000, size: 0 })).toBe(0);
  });
});

describe("sortListings", () => {
  const listings = [
    { id: 1, price: 300000, size: 60, areaScore: 70 },
    { id: 2, price: 200000, size: 90, areaScore: 90 },
    { id: 3, price: 250000, size: 75, areaScore: 80 },
  ];

  test("sorts by price ascending", () => {
    expect(sortListings(listings, "price-asc").map((l) => l.id)).toEqual([2, 3, 1]);
  });

  test("sorts by price descending", () => {
    expect(sortListings(listings, "price-desc").map((l) => l.id)).toEqual([1, 3, 2]);
  });

  test("sorts by size descending", () => {
    expect(sortListings(listings, "size-desc").map((l) => l.id)).toEqual([2, 3, 1]);
  });

  test("sorts by area score descending", () => {
    expect(sortListings(listings, "score-desc").map((l) => l.id)).toEqual([2, 3, 1]);
  });

  test("returns listings unchanged for an unknown method", () => {
    expect(sortListings(listings, "unknown").map((l) => l.id)).toEqual([1, 2, 3]);
  });

  test("does not mutate the original array", () => {
    const original = [...listings];
    sortListings(listings, "price-asc");
    expect(listings).toEqual(original);
  });
});
