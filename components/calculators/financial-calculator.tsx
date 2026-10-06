"use client";

import { useState } from "react";
import { Calculator, CircleHelp } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  calculateFixedDeposit,
  calculateLoanEmi,
  calculateLumpSum,
  calculateSip,
  calculateSwp,
} from "@/lib/financial-calculators";

const calculatorModes = ["SIP", "SWP", "Lump sum", "FD", "Loan"] as const;
type CalculatorMode = (typeof calculatorModes)[number];
type FieldValues = Record<string, number>;

const modeDetails: Record<CalculatorMode, { title: string; summary: string; more: string }> = {
  SIP: {
    title: "What is a SIP?",
    summary: "A Systematic Investment Plan invests a fixed amount at regular intervals, commonly monthly, into a mutual fund or other investment.",
    more: "Regular contributions buy more units when prices are lower and fewer when prices are higher. This is called rupee-cost averaging; it does not remove market risk or guarantee returns. The estimate assumes a steady annual return, while actual investment returns fluctuate.",
  },
  SWP: {
    title: "What is an SWP?",
    summary: "A Systematic Withdrawal Plan pays a chosen amount out of an investment corpus at regular intervals, often monthly.",
    more: "The remaining corpus stays invested, so actual outcomes depend on returns and the timing of withdrawals. If withdrawals and fees outpace growth, the corpus can run down sooner than expected. This estimate applies a steady monthly return and withdraws at month end.",
  },
  "Lump sum": {
    title: "What is a lump-sum investment?",
    summary: "A lump-sum investment puts the full amount into an investment at one time instead of spreading contributions over multiple dates.",
    more: "The estimate compounds one assumed annual return over the selected period. Market returns are not steady or guaranteed, and investing all at once exposes the full amount to market movements from the start.",
  },
  FD: {
    title: "What is a Fixed Deposit (FD)?",
    summary: "A fixed deposit places a one-time amount with a bank or financial institution for a chosen tenure at a stated interest rate.",
    more: "This estimate assumes a constant rate compounded quarterly and no interim withdrawals. Actual FD terms, compounding frequency, premature-withdrawal penalties, tax treatment, and rates vary by institution and product.",
  },
  Loan: {
    title: "How is a loan EMI calculated?",
    summary: "An Equated Monthly Instalment (EMI) is the regular payment used to repay loan principal and interest over a set tenure.",
    more: "For a reducing-balance loan, each payment covers interest on the outstanding balance plus some principal. This estimate assumes the rate stays unchanged and excludes fees, insurance, and other charges; floating-rate changes can alter the actual repayment.",
  },
};

const initialValues: Record<CalculatorMode, FieldValues> = {
  SIP: { monthly: 5000, rate: 12, years: 10 },
  SWP: { corpus: 1000000, withdrawal: 10000, rate: 6, years: 10 },
  "Lump sum": { principal: 100000, rate: 12, years: 10 },
  FD: { principal: 100000, rate: 7, years: 5 },
  Loan: { principal: 1000000, rate: 9, years: 5 },
};

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function FinancialCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("SIP");
  const [values, setValues] = useState(initialValues);
  const details = modeDetails[mode];
  const fields = values[mode];
  const sipResult = calculateSip(values.SIP.monthly, values.SIP.rate, values.SIP.years);
  const swpResult = calculateSwp(values.SWP.corpus, values.SWP.withdrawal, values.SWP.rate, values.SWP.years);
  const lumpSumResult = calculateLumpSum(values["Lump sum"].principal, values["Lump sum"].rate, values["Lump sum"].years);
  const fdResult = calculateFixedDeposit(values.FD.principal, values.FD.rate, values.FD.years);
  const loanResult = calculateLoanEmi(values.Loan.principal, values.Loan.rate, values.Loan.years);

  function updateField(name: string, value: number) {
    setValues((current) => ({
      ...current,
      [mode]: { ...current[mode], [name]: Number.isFinite(value) ? Math.max(0, value) : 0 },
    }));
  }

  const inputFields = mode === "SIP"
    ? [
      { name: "monthly", label: "Monthly investment", prefix: "₹", step: 500, max: 100000000 },
      { name: "rate", label: "Expected annual return", suffix: "%", step: 0.1, max: 100 },
      { name: "years", label: "Investment period", suffix: "years", step: 1, max: 100 },
    ]
    : mode === "SWP"
      ? [
        { name: "corpus", label: "Starting investment", prefix: "₹", step: 10000, max: 10000000000 },
        { name: "withdrawal", label: "Monthly withdrawal", prefix: "₹", step: 500, max: 100000000 },
        { name: "rate", label: "Expected annual return", suffix: "%", step: 0.1, max: 100 },
        { name: "years", label: "Withdrawal period", suffix: "years", step: 1, max: 100 },
      ]
      : [
        { name: "principal", label: mode === "Loan" ? "Loan amount" : "Investment amount", prefix: "₹", step: 10000, max: 10000000000 },
        { name: "rate", label: mode === "Loan" ? "Annual interest rate" : "Annual interest / return", suffix: "%", step: 0.1, max: 100 },
        { name: "years", label: "Period", suffix: "years", step: 1, max: 100 },
      ];

  return (
    <section id="calculators" className="mx-auto max-w-7xl scroll-mt-8 px-6 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f665d]">Plan with clarity</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#013220]">Financial calculators</h2>
          <p className="mt-2 text-sm text-[#4f665d]">Explore estimates and learn how each calculation works.</p>
        </div>
        <Calculator className="hidden h-8 w-8 text-[#006400] sm:block" />
      </div>

      <Card className="border-[#dfeee3] bg-white p-5 shadow-[0_18px_40px_rgba(1,50,32,0.06)] md:p-7">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calculator type">
          {calculatorModes.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => setMode(item)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${mode === item ? "border-[#013220] bg-[#013220] text-white" : "border-[#dfeee3] bg-white text-[#214b3d] hover:bg-[#f5fff7]"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {inputFields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-[#214b3d]">
                {field.label}
                <span className="mt-2 flex items-center rounded-xl border border-[#dfeee3] bg-[#fbfefb] px-3 focus-within:border-[#32CD32]">
                  {field.prefix ? <span className="text-sm text-[#5f7468]">{field.prefix}</span> : null}
                  <input
                    type="number"
                    min="0"
                    max={field.max}
                    step={field.step}
                    value={fields[field.name]}
                    onChange={(event) => updateField(field.name, event.target.valueAsNumber)}
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[#013220] outline-none"
                  />
                  {field.suffix ? <span className="text-xs text-[#5f7468]">{field.suffix}</span> : null}
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-[#dfeee3] bg-[#f5fff7] p-5">
            <p className="text-sm font-medium text-[#4f665d]">{mode} estimate</p>
            {mode === "Loan" ? (
              <>
                <p className="mt-2 text-3xl font-semibold text-[#013220]">{formatCurrency(loanResult.emi)}<span className="ml-1 text-sm font-normal text-[#4f665d]">/ month</span></p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Total repayment</dt><dd className="font-semibold text-[#013220]">{formatCurrency(loanResult.totalPaid)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Total interest</dt><dd className="font-semibold text-[#013220]">{formatCurrency(loanResult.interest)}</dd></div>
                </dl>
              </>
            ) : mode === "SWP" ? (
              <>
                <p className="mt-2 text-3xl font-semibold text-[#013220]">{formatCurrency(swpResult.balance)}<span className="ml-1 text-sm font-normal text-[#4f665d]">remaining</span></p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Total withdrawn</dt><dd className="font-semibold text-[#013220]">{formatCurrency(swpResult.withdrawn)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Monthly withdrawals made</dt><dd className="font-semibold text-[#4f665d]">{swpResult.withdrawals}</dd></div>
                </dl>
              </>
            ) : (
              <>
                <p className="mt-2 text-3xl font-semibold text-[#013220]">{formatCurrency((mode === "SIP" ? sipResult : mode === "FD" ? fdResult : lumpSumResult).value)}<span className="ml-1 text-sm font-normal text-[#4f665d]">estimated value</span></p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Amount invested</dt><dd className="font-semibold text-[#013220]">{formatCurrency((mode === "SIP" ? sipResult : mode === "FD" ? fdResult : lumpSumResult).invested)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-[#4f665d]">Estimated growth / interest</dt><dd className="font-semibold text-[#013220]">{formatCurrency((mode === "SIP" ? sipResult : mode === "FD" ? fdResult : lumpSumResult).interest)}</dd></div>
                </dl>
              </>
            )}
            <p className="mt-5 text-xs leading-5 text-[#5f7468]">Illustrative estimate only. Actual returns, rates, taxes, fees, and product terms can differ.</p>
          </div>
        </div>

        <details className="mt-7 rounded-xl border border-[#f3c6dc] bg-[#fff6fa] p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[#831843] [&::-webkit-details-marker]:hidden">
            <CircleHelp className="h-4 w-4 shrink-0" />
            {details.title}
            <span className="ml-auto text-xs font-medium text-[#9d5276]">Click to learn more</span>
          </summary>
          <div className="mt-4 space-y-3 border-t border-[#f3c6dc] pt-4 text-sm leading-6 text-[#5c3245]">
            <p>{details.summary}</p>
            <p>{details.more}</p>
          </div>
        </details>
      </Card>
    </section>
  );
}
