import { describe, expect, it } from "vitest";
import {
  calculateFixedDeposit,
  calculateLoanEmi,
  calculateLumpSum,
  calculateSip,
  calculateSwp,
} from "./financial-calculators";

describe("financial calculator formulas", () => {
  it("calculates SIP corpus and handles zero returns", () => {
    expect(calculateSip(1000, 0, 1)).toEqual({ invested: 12000, value: 12000, interest: 0 });
    expect(calculateSip(1000, 12, 1).value).toBeGreaterThan(12000);
  });

  it("caps SWP withdrawals when corpus is exhausted", () => {
    expect(calculateSwp(1000, 600, 0, 3)).toEqual({ withdrawn: 1000, balance: 0, withdrawals: 2 });
  });

  it("calculates lump-sum compound growth", () => {
    expect(calculateLumpSum(10000, 10, 2).value).toBeCloseTo(12100, 2);
  });

  it("calculates fixed deposit with quarterly compounding", () => {
    expect(calculateFixedDeposit(10000, 8, 1).value).toBeCloseTo(10824.32, 1);
  });

  it("calculates a reducing-balance loan EMI and zero-interest loan", () => {
    expect(calculateLoanEmi(120000, 0, 1)).toEqual({ emi: 10000, totalPaid: 120000, interest: 0 });
    expect(calculateLoanEmi(120000, 12, 1).emi).toBeGreaterThan(10000);
  });
});
