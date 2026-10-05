import { NextRequest } from "next/server";
import { getQuote } from "@/lib/market-api";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim();

  if (!symbol) {
    return Response.json({ error: "Missing symbol" }, { status: 400 });
  }

  const quote = await getQuote(symbol);

  if (!quote) {
    return Response.json({ error: "Quote unavailable for this symbol." }, { status: 404 });
  }

  return Response.json({
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    percentChange: quote.percentChange,
    change: quote.change,
    status: quote.status,
    updatedAt: quote.updatedAt,
    exchange: quote.exchange,
  });
}
