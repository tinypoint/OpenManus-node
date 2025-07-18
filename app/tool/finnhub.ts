import { BaseTool, ToolError } from "./base";
import fetch from "node-fetch";

/**
 * Generic tool to query the Finnhub API.
 * Provide an API endpoint path and optional query parameters.
 */
export class FinnhubAPI extends BaseTool {
  constructor() {
    super(
      "finnhub_api",
      "Query the Finnhub stock market API using a specific endpoint and parameters.",
      {
        type: "object",
        properties: {
          endpoint: { type: "string", description: "(required) API endpoint, e.g. 'quote' or 'stock/candle'." },
          params: { type: "object", description: "(optional) Query parameters for the endpoint (excluding token)." }
        },
        required: ["endpoint"],
        additionalProperties: false
      }
    );
  }

  async execute(args: { endpoint: string; params?: Record<string, any> }): Promise<string> {
    const { endpoint, params = {} } = args;
    if (!endpoint) throw new ToolError("endpoint is required");
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new ToolError("FINNHUB_API_KEY environment variable not set");

    const url = new URL(`https://finnhub.io/api/v1/${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.append(k, String(v));
    }
    url.searchParams.append("token", apiKey);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        const text = await res.text();
        throw new ToolError(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      return JSON.stringify(data);
    } catch (e: any) {
      if (e instanceof ToolError) throw e;
      throw new ToolError(`Finnhub API request failed: ${e.message}`);
    }
  }
}
