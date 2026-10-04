import { describe, expect, it } from "vitest";
import { correlatedResponseBodySchema } from "#ferrousaurus/system-one-mcp/data/response.ts";
import { request, response } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

describe("correlated response schema", () => {
  it("accepts answers correlated to every request question", () => {
    expect(correlatedResponseBodySchema(request).parse(response)).toEqual(response);
  });

  it("accepts a request with no questions", () => {
    expect(
      correlatedResponseBodySchema({ state: "Empty", questions: {} }).parse({
        model: "jev",
        answers: {},
        usage: {
          input_tokens: 0,
          output_tokens: 0,
        },
      }),
    ).toEqual({
      model: "jev",
      answers: {},
      usage: {
        input_tokens: 0,
        output_tokens: 0,
      },
    });
  });

  it("rejects a missing answer", () => {
    const invalidResponse = {
      ...response,
      answers: {
        choice: response.answers.choice,
        noul: response.answers.noul,
      },
    };

    expect(correlatedResponseBodySchema(request).safeParse(invalidResponse).success).toBe(false);
  });

  it("rejects an answer with the wrong type", () => {
    const invalidResponse = {
      ...response,
      answers: {
        ...response.answers,
        choice: response.answers.noul,
      },
    };

    expect(correlatedResponseBodySchema(request).safeParse(invalidResponse).success).toBe(false);
  });

  it("rejects invalid probabilities and usage values", () => {
    const invalidResponse = {
      ...response,
      answers: {
        ...response.answers,
        choice: {
          ...response.answers.choice,
          confidence: 2,
        },
      },
      usage: {
        input_tokens: -1,
        output_tokens: 1.5,
      },
    };

    expect(correlatedResponseBodySchema(request).safeParse(invalidResponse).success).toBe(false);
  });
});
