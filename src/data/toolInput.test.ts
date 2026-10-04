import { describe, expect, it } from "vitest";

describe("tool input module", () => {
  it("loads the request schema module used for the input type", async () => {
    const module = await import("#ferrousaurus/system-one-mcp/data/toolInput.ts");

    expect(Object.keys(module)).toEqual([]);
  });
});
