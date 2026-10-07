import { z } from "zod";
import type { ChoiceQuestion, TypesafeRequestBody, ScoreQuestion } from "./request.ts";

export const choiceAnswerSchema = (choiceQuestion: ChoiceQuestion) =>
  z
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
      probabilities: z.object(
        Object.fromEntries(
          Object.keys(choiceQuestion.criteria).map((k) => [
            k,
            z
              .number()
              .min(0)
              .max(1)
              .describe(
                "A number between 0 and 1 representing the model's confidence in the choice.",
              ),
          ]),
        ),
      ),
    })
    .describe("A question that asks for a choice, with criteria for each choice.");

export const scoreAnswerSchema = (scoreQuestion: ScoreQuestion) =>
  z
    .object({
      type: z.literal("score"),
      score: z
        .number()
        .describe(
          "The probability-weighted mean of the zero-based indices of the scoreQuestionSchema.criteria array; may be fractional.",
        ),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("A number between 0 and 1 representing the model's confidence in its score."),
      legend: z.object(
        Object.fromEntries(
          scoreQuestion.criteria.map((c, i) => [
            i,
            z
              .literal(c)
              .describe(
                "The criterion for the score, which must be a valid value of the scoreQuestionSchema.criteria array.",
              ),
          ]),
        ),
      ),
      probabilities: z.object(
        Object.fromEntries(
          scoreQuestion.criteria.map((c, i) => [
            i,
            z
              .number()
              .min(0)
              .max(1)
              .describe(
                "A number between 0 and 1 representing the model's confidence in the score.",
              ),
          ]),
        ),
      ),
    })
    .describe("A question that asks for a score, with criteria for each score.");

export const noulAnswerSchema = z
  .object({
    type: z.literal("noul"),
    noul: z
      .number()
      .min(0)
      .max(1)
      .describe("A number between 0 and 1 representing the model's confidence in the noul."),
  })
  .describe(
    "A question that asks for a probability of truth, with optional criteria for true and false.",
  );

export const correlatedResponseBodySchema = (requestBody: TypesafeRequestBody) =>
  z
    .object({
      model: z.string().describe("The model used to generate the answers."),
      answers: z
        .object(
          Object.fromEntries(
            Object.entries(requestBody.questions).map(([k, v]) => {
              const answerSchema =
                v.type === "choice"
                  ? choiceAnswerSchema(v)
                  : v.type === "score"
                    ? scoreAnswerSchema(v)
                    : noulAnswerSchema;
              return [k, answerSchema.describe(`An answer object for question ID ${k}.`)];
            }),
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
