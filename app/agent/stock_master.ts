import { ToolCallAgent } from "./toolcall";
import { ToolCollection } from "../tool/base";
import { FinnhubAPI } from "../tool/finnhub";
import { Terminate } from "../tool/terminate";
import { SYSTEM_PROMPT, NEXT_STEP_PROMPT } from "../prompt/stock_master";

/** StockMaster: an agent focused on intraday US stock trading guidance */
export class StockMaster extends ToolCallAgent {
  static SYSTEM_PROMPT: string = SYSTEM_PROMPT;
  static NEXT_STEP_PROMPT: string = NEXT_STEP_PROMPT;

  constructor(options: any = {}) {
    super({
      name: "StockMaster",
      description: "US stock intraday momentum trading assistant",
      system_prompt: StockMaster.SYSTEM_PROMPT,
      next_step_prompt: StockMaster.NEXT_STEP_PROMPT,
      max_steps: options.max_steps ?? 30
    });
    this["available_tools"] = new ToolCollection(
      new FinnhubAPI(),
      new Terminate()
    );
  }
}
