import { describe, expect, it } from "vitest";
import openai from "#ferrousaurus/system-one-mcp/lib/openai.ts";
import { request } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

describe("openai provider", () => {
  it("reports that the provider is not implemented", async () => {
    await expect(openai(request)).rejects.toThrow(
      "The OpenAI tool is not implemented yet. Please use the 'typesafe' tool instead.",
    );
  });
});
