import { BaseTool, ToolError } from "./base";
import fetch from "node-fetch";

/** Base helper class for Finnhub tools */
abstract class FinnhubTool extends BaseTool {
  protected async request(endpoint: string, params: Record<string, any>): Promise<string> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new ToolError("FINNHUB_API_KEY environment variable not set");

    const url = new URL(`https://finnhub.io/api/v1/${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    }
    url.searchParams.append("token", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text();
      throw new ToolError(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    return JSON.stringify(data);
  }
}

/** Get real-time quote for a stock symbol */
export class FinnhubQuote extends FinnhubTool {
  constructor() {
    super(
      "finnhub_quote",
      "Retrieve current quote information for a stock symbol.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." }
        },
        required: ["symbol"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string }): Promise<string> {
    const { symbol } = args;
    if (!symbol) throw new ToolError("symbol is required");
    return this.request("quote", { symbol });
  }
}

/** Get VWAP values within a time range */
export class FinnhubVWAP extends FinnhubTool {
  constructor() {
    super(
      "finnhub_vwap",
      "Fetch VWAP indicator data for a symbol.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." },
          resolution: { type: "string", description: "(optional) Candle resolution (e.g. 1,5,15).", default: "1" },
          from: { type: "integer", description: "(required) Start UNIX timestamp." },
          to: { type: "integer", description: "(required) End UNIX timestamp." }
        },
        required: ["symbol", "from", "to"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string; resolution?: string; from: number; to: number }): Promise<string> {
    const { symbol, resolution = "1", from, to } = args;
    if (!symbol || !from || !to) throw new ToolError("symbol, from and to are required");
    return this.request("indicator", { symbol, resolution, indicator: "vwap", from, to });
  }
}

/** Get EMA data for a symbol */
export class FinnhubEMA extends FinnhubTool {
  constructor() {
    super(
      "finnhub_ema",
      "Fetch EMA indicator data for a stock symbol.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." },
          resolution: { type: "string", description: "(optional) Candle resolution", default: "1" },
          from: { type: "integer", description: "(required) Start UNIX timestamp." },
          to: { type: "integer", description: "(required) End UNIX timestamp." },
          timeperiod: { type: "integer", description: "(required) EMA period (e.g. 9 or 20)." }
        },
        required: ["symbol", "from", "to", "timeperiod"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string; resolution?: string; from: number; to: number; timeperiod: number }): Promise<string> {
    const { symbol, resolution = "1", from, to, timeperiod } = args;
    if (!symbol || !from || !to || !timeperiod) throw new ToolError("symbol, from, to and timeperiod are required");
    return this.request("indicator", { symbol, resolution, indicator: "ema", timeperiod, from, to });
  }
}

/** Get Level 2 order book for a stock */
export class FinnhubOrderBook extends FinnhubTool {
  constructor() {
    super(
      "finnhub_orderbook",
      "Retrieve level 2 order book data for a stock symbol.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." }
        },
        required: ["symbol"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string }): Promise<string> {
    const { symbol } = args;
    if (!symbol) throw new ToolError("symbol is required");
    return this.request("stock/orderbook", { symbol });
  }
}

/** Get recent trade ticks (Time & Sales) */
export class FinnhubTimeSales extends FinnhubTool {
  constructor() {
    super(
      "finnhub_time_sales",
      "Fetch recent trade ticks for a stock symbol.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." },
          limit: { type: "integer", description: "(optional) Number of ticks to return", default: 50 }
        },
        required: ["symbol"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string; limit?: number }): Promise<string> {
    const { symbol, limit = 50 } = args;
    if (!symbol) throw new ToolError("symbol is required");
    return this.request("stock/trades", { symbol, limit });
  }
}

/** Get candlestick data for pre-market session */
export class FinnhubPreMarket extends FinnhubTool {
  constructor() {
    super(
      "finnhub_premarket",
      "Fetch candle data for a symbol within the specified pre-market time range.",
      {
        type: "object",
        properties: {
          symbol: { type: "string", description: "(required) Stock symbol." },
          from: { type: "integer", description: "(required) Start UNIX timestamp." },
          to: { type: "integer", description: "(required) End UNIX timestamp." },
          resolution: { type: "string", description: "(optional) Candle resolution", default: "1" }
        },
        required: ["symbol", "from", "to"],
        additionalProperties: false
      }
    );
  }
  async execute(args: { symbol: string; from: number; to: number; resolution?: string }): Promise<string> {
    const { symbol, from, to, resolution = "1" } = args;
    if (!symbol || !from || !to) throw new ToolError("symbol, from and to are required");
    return this.request("stock/candle", { symbol, from, to, resolution });
  }
}
