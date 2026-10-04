import { describe, expect, it } from "vitest";
import {
  choiceQuestionSchema,
  noulQuestionSchema,
  scoreQuestionSchema,
  typesafeRequestBodySchema,
} from "#ferrousaurus/system-one-mcp/data/request.ts";
import { request } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

describe("request schemas", () => {
  it("accepts each question variant", () => {
    expect(choiceQuestionSchema.parse(request.questions.choice)).toEqual(request.questions.choice);
    expect(scoreQuestionSchema.parse(request.questions.score)).toEqual(request.questions.score);
    expect(noulQuestionSchema.parse(request.questions.noul)).toEqual(request.questions.noul);
  });

  it("accepts a noul question without criteria", () => {
    expect(
      noulQuestionSchema.parse({
        type: "noul",
        instructions: "Is this true?",
      }),
    ).toEqual({
      type: "noul",
      instructions: "Is this true?",
    });
  });

  it("accepts a complete request", () => {
    expect(typesafeRequestBodySchema.parse(request)).toEqual(request);
  });

  it("rejects an invalid question discriminant", () => {
    const invalidRequest = {
      ...request,
      questions: {
        invalid: {
          type: "unknown",
          instructions: "Invalid question",
        },
      },
    };

    expect(typesafeRequestBodySchema.safeParse(invalidRequest).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(
      typesafeRequestBodySchema.safeParse({
        state: "The current state",
        questions: {},
      }).success,
    ).toBe(true);
    expect(
      typesafeRequestBodySchema.safeParse({
        questions: {},
      }).success,
    ).toBe(false);
  });
});
