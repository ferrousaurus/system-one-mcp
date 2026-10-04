import { z } from "zod";

export const choiceQuestionSchema = z
  .object({
    type: z.literal("choice"),
    instructions: z.string().describe("A question that asks for a choice, with instructions."),
    criteria: z
      .record(z.string(), z.string())
      .describe(
        "A record of criteria for each choice, where the key is the choice and the value is the criteria for that choice.",
      ),
  })
  .describe("A question that asks for a choice, with criteria for each choice.");

export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>;

export const scoreQuestionSchema = z
  .object({
    type: z.literal("score"),
    instructions: z.string().describe("A question that asks for a score, with instructions."),
    criteria: z.array(z.string()).describe("An array of criteria for each score."),
  })
  .describe("A question that asks for a score, with criteria for each score.");

export type ScoreQuestion = z.infer<typeof scoreQuestionSchema>;

export const noulQuestionSchema = z
  .object({
    type: z.literal("noul"),
    instructions: z
      .string()
      .describe("A question that asks for a probability of truth, with instructions."),
    criteria: z
      .object({
        true: z.string().describe("A criterion for the truth of the statement."),
        false: z.string().describe("A criterion for the falsity of the statement."),
      })
      .optional()
      .describe("Optional criteria for the truth and falsity of the statement."),
  })
  .describe(
    "A question that asks for a probability of truth, with optional criteria for true and false.",
  );

export type NoulQuestion = z.infer<typeof noulQuestionSchema>;

export const typesafeRequestBodySchema = z
  .object({
    state: z
      .string()
      .describe(
        "A string representing the state of the world, which may be used to inform the answers to the questions.",
      ),
    questions: z
      .record(
        z.string().describe("The question ID, which is a unique identifier for the question."),
        z
          .discriminatedUnion("type", [
            choiceQuestionSchema,
            scoreQuestionSchema,
            noulQuestionSchema,
          ])
          .describe(
            "A question object, which may be a choice question, a score question, or a noul question.",
          ),
      )
      .describe(
        "A record of questions, where the key is the question ID and the value is the question object.",
      ),
  })
  .describe(
    "A request body that contains a state and a record of questions, where the key is the question ID and the value is the question object.",
  );

export type TypesafeRequestBody = z.infer<typeof typesafeRequestBodySchema>;
