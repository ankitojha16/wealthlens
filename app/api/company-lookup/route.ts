import { getCompanyResearch, getQuote, searchStocks } from "@/lib/market-api";

export async function POST(request: Request) {
  let body: { company?: unknown; symbol?: unknown };
  try {
    body = await request.json() as { company?: unknown; symbol?: unknown };
  } catch {
    return Response.json({ error: "Enter a company name or stock symbol." }, { status: 400 });
  }

  const companyQuery = typeof body.company === "string" ? body.company.trim() : "";
  const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  if (!companyQuery || companyQuery.length > 100) {
    return Response.json({ error: "Enter a company name or stock symbol (up to 100 characters)." }, { status: 400 });
  }

  try {
    const matches = await searchStocks(companyQuery);
    if (!symbol) return Response.json({ matches });

    const match = matches.find((item) => item.symbol === symbol);
    if (!match) {
      return Response.json({ error: "That symbol is not among the companies returned for this search." }, { status: 404 });
    }

    const [company, quote] = await Promise.all([
      getCompanyResearch(symbol),
      getQuote(symbol),
    ]);
    if (!company || !quote) {
      return Response.json({ error: "The market data provider could not verify this stock. Try another result." }, { status: 404 });
    }

    return Response.json({
      verified: {
        symbol: company.symbol,
        name: company.name,
        exchange: company.exchange,
        industry: company.industry,
        price: quote.price,
        status: quote.status,
      },
    });
  } catch {
    return Response.json({ error: "Could not verify this company with the market data provider. Please try again." }, { status: 502 });
  }
}
