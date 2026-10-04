import { z } from "zod";
import { noulAnswerSchema } from "./response.ts";

export const integerStringSchema = z.string().regex(/^\d+$/, {
  message: "Must be an integer of at least 0",
});

const choiceAnswerSchema = z
  .object({
    type: z.literal("choice"),
    choice: z
      .string()
      .describe(
        "The choice made by the model, which must be a valid key of the probabilities object.",
      ),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("A number between 0 and 1 representing the model's confidence in its choice."),
    probabilities: z.record(
      z
        .string()
        .describe(
          "The choice, which must be a valid key of the choiceQuestionSchema.criteria object.",
        ),
      z
        .number()
        .min(0)
        .max(1)
        .describe("A number between 0 and 1 representing the model's confidence in the choice."),
    ),
  })
  .describe("A question that asks for a choice, with criteria for each choice.");

const scoreAnswerSchema = z
  .object({
    type: z.literal("score"),
    score: z
      .number()
      .describe(
        "The score given by the model, which must be a valid index of the scoreQuestionSchema.criteria array.",
      ),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("A number between 0 and 1 representing the model's confidence in its score."),
    legend: z.record(
      integerStringSchema.describe(
        "The index of the score, which must be a valid index of the scoreQuestionSchema.criteria array.",
      ),
      z
        .string()
        .describe(
          "The criterion for the score, which must be a valid value of the scoreQuestionSchema.criteria array.",
        ),
    ),
    probabilities: z.record(
      integerStringSchema.describe(
        "The index of the score, which must be a valid index of the scoreQuestionSchema.criteria array.",
      ),
      z
        .number()
        .min(0)
        .max(1)
        .describe("A number between 0 and 1 representing the model's confidence in the score."),
    ),
  })
  .describe("A question that asks for a score, with criteria for each score.");

export const typesafeResponseBodySchema = z
  .object({
    model: z.string().describe("The model used to generate the answers."),
    answers: z
      .record(
        z.string().describe("The question ID, which is a unique identifier for the question."),
        z
          .discriminatedUnion("type", [choiceAnswerSchema, scoreAnswerSchema, noulAnswerSchema])
          .describe(
            "An answer object, which may be a choice answer, a score answer, or a noul answer.",
          ),
      )
      .describe(
        "A record of answers, where the key is the question ID and the value is the answer object.",
      ),
    usage: z
      .object({
        input_tokens: z
          .number()
          .int()
          .min(0)
          .describe("The number of input tokens used to generate the answers."),
        output_tokens: z
          .number()
          .int()
          .min(0)
          .describe("The number of output tokens used to generate the answers."),
      })
      .describe(
        "An object containing usage information, including the number of input and output tokens used.",
      ),
  })
  .describe(
    "A response body that contains the model used, a record of answers, and usage information.",
  );

export type TypesafeResponseBody = z.infer<typeof typesafeResponseBodySchema>;
