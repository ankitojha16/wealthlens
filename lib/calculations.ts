export function calculateReturn(initial: number, current: number) {
  if (!Number.isFinite(initial) || !Number.isFinite(current) || initial === 0) {
    return 0;
  }

  return ((current - initial) / initial) * 100;
}

export function calculateCAGR(startValue: number, endValue: number, years: number) {
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue) || !Number.isFinite(years) || years <= 0 || startValue <= 0) {
    return 0;
  }

  return ((Math.pow(endValue / startValue, 1 / years) - 1) * 100);
}

export function calculateVolatility(values: number[]) {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);

  return Math.sqrt(variance) * 100;
}

export function calculateMaxDrawdown(values: number[]) {
  if (values.length < 2) return 0;

  let peak = values[0];
  let maxDrawdown = 0;

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

export function calculateBeta(values: number[], benchmark: number[]) {
  if (values.length < 2 || values.length !== benchmark.length) return 0;

  const assetMean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const benchmarkMean = benchmark.reduce((sum, value) => sum + value, 0) / benchmark.length;

  let numerator = 0;
  let denominator = 0;

  for (let index = 0; index < values.length; index += 1) {
    numerator += (values[index] - assetMean) * (benchmark[index] - benchmarkMean);
    denominator += (benchmark[index] - benchmarkMean) ** 2;
  }

  if (denominator === 0) return 0;

  return numerator / denominator;
}

export function calculateSharpe(returns: number[], riskFreeRate = 0) {
  if (returns.length === 0) return 0;

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return ((mean - riskFreeRate) / stdDev) * 100;
}

export function calculatePortfolioWeight(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) return 0;

  return (value / total) * 100;
}

export function calculateCorrelation(valuesA: number[], valuesB: number[]) {
  if (valuesA.length !== valuesB.length || valuesA.length < 2) return 0;

  const meanA = valuesA.reduce((sum, value) => sum + value, 0) / valuesA.length;
  const meanB = valuesB.reduce((sum, value) => sum + value, 0) / valuesB.length;

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let index = 0; index < valuesA.length; index += 1) {
    const diffA = valuesA[index] - meanA;
    const diffB = valuesB[index] - meanB;

    numerator += diffA * diffB;
    denominatorA += diffA ** 2;
    denominatorB += diffB ** 2;
  }

  if (denominatorA === 0 || denominatorB === 0) return 0;

  return numerator / Math.sqrt(denominatorA * denominatorB);
}

export function calculateAnnualizedReturn(startValue: number, endValue: number, years: number) {
  return calculateCAGR(startValue, endValue, years);
}
