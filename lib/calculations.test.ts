import { describe, expect, it } from "vitest";
import { calculateCAGR, calculateMaxDrawdown, calculatePortfolioWeight, calculateReturn, calculateVolatility } from "./calculations";

describe("financial calculations", () => {
  it("computes return correctly", () => {
    expect(calculateReturn(100, 120)).toBeCloseTo(20, 5);
  });

  it("computes CAGR correctly", () => {
    expect(calculateCAGR(100, 200, 5)).toBeCloseTo(14.8698, 3);
  });

  it("computes volatility correctly", () => {
    expect(calculateVolatility([100, 110, 90, 120])).toBeGreaterThan(0);
  });

  it("computes max drawdown", () => {
    expect(calculateMaxDrawdown([100, 90, 80, 95])).toBeGreaterThan(0);
  });

  it("computes portfolio weights", () => {
    expect(calculatePortfolioWeight(25, 100)).toBe(25);
  });
});
