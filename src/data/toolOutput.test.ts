import { describe, expect, it } from "vitest";
import {
  integerStringSchema,
  typesafeResponseBodySchema,
} from "#ferrousaurus/system-one-mcp/data/toolOutput.ts";
import { output } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

describe("tool output schemas", () => {
  it("accepts a complete output", () => {
    expect(typesafeResponseBodySchema.parse(output)).toEqual(output);
  });

  it("accepts non-negative integer strings", () => {
    expect(integerStringSchema.parse("0")).toBe("0");
    expect(integerStringSchema.parse("12")).toBe("12");
  });

  it("rejects non-integer strings", () => {
    expect(integerStringSchema.safeParse("-1").success).toBe(false);
    expect(integerStringSchema.safeParse("1.5").success).toBe(false);
    expect(integerStringSchema.safeParse("one").success).toBe(false);
  });

  it("rejects invalid output values", () => {
    const invalidOutput = {
      ...output,
      answers: {
        ...output.answers,
        score: {
          ...output.answers.score,
          probabilities: {
            "-1": 0.2,
            "1.5": 0.8,
          },
        },
      },
      usage: {
        input_tokens: -1,
        output_tokens: 1.5,
      },
    };

    expect(typesafeResponseBodySchema.safeParse(invalidOutput).success).toBe(false);
  });
});
