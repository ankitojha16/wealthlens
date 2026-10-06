export type CalculatorResult = {
  invested: number;
  value: number;
  interest: number;
};

export function calculateSip(monthlyInvestment: number, annualRate: number, years: number): CalculatorResult {
  const months = Math.floor(years * 12);
  const invested = monthlyInvestment * months;
  const monthlyRate = annualRate / 100 / 12;
  const value = months <= 0
    ? 0
    : monthlyRate === 0
      ? invested
      : monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return { invested, value, interest: value - invested };
}

export function calculateSwp(corpus: number, monthlyWithdrawal: number, annualRate: number, years: number) {
  const months = Math.floor(years * 12);
  const monthlyRate = annualRate / 100 / 12;
  let balance = corpus;
  let withdrawn = 0;
  let withdrawals = 0;

  for (let month = 0; month < months && balance > 0; month += 1) {
    balance *= 1 + monthlyRate;
    const amount = Math.min(monthlyWithdrawal, balance);
    balance -= amount;
    withdrawn += amount;
    if (amount > 0) withdrawals += 1;
  }

  return { withdrawn, balance, withdrawals };
}

export function calculateLumpSum(principal: number, annualRate: number, years: number): CalculatorResult {
  const value = principal * Math.pow(1 + annualRate / 100, years);
  return { invested: principal, value, interest: value - principal };
}

export function calculateFixedDeposit(principal: number, annualRate: number, years: number): CalculatorResult {
  const value = principal * Math.pow(1 + annualRate / 400, years * 4);
  return { invested: principal, value, interest: value - principal };
}

export function calculateLoanEmi(principal: number, annualRate: number, years: number) {
  const months = Math.floor(years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const emi = months <= 0
    ? 0
    : monthlyRate === 0
      ? principal / months
      : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPaid = emi * months;

  return { emi, totalPaid, interest: totalPaid - principal };
}
