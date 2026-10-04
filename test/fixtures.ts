import type { TypesafeRequestBody } from "#ferrousaurus/system-one-mcp/data/request.ts";
import type { TypesafeResponseBody } from "#ferrousaurus/system-one-mcp/data/toolOutput.ts";

export const request = {
  state: "The current state",
  questions: {
    choice: {
      type: "choice",
      instructions: "Choose an option.",
      criteria: {
        first: "The first option",
        second: "The second option",
      },
    },
    score: {
      type: "score",
      instructions: "Give a score.",
      criteria: ["Low", "High"],
    },
    noul: {
      type: "noul",
      instructions: "Is this true?",
      criteria: {
        true: "It is true",
        false: "It is false",
      },
    },
  },
} satisfies TypesafeRequestBody;

export const response = {
  model: "jev",
  answers: {
    choice: {
      type: "choice",
      choice: "first",
      confidence: 0.9,
      probabilities: {
        first: 0.9,
        second: 0.1,
      },
    },
    score: {
      type: "score",
      score: 1,
      confidence: 0.8,
      legend: {
        0: "Low",
        1: "High",
      },
      probabilities: {
        0: 0.2,
        1: 0.8,
      },
    },
    noul: {
      type: "noul",
      noul: 0.7,
    },
  },
  usage: {
    input_tokens: 10,
    output_tokens: 20,
  },
} satisfies TypesafeResponseBody;

export const output = {
  ...response,
  answers: {
    ...response.answers,
    score: {
      ...response.answers.score,
      legend: {
        "0": "Low",
        "1": "High",
      },
      probabilities: {
        "0": 0.2,
        "1": 0.8,
      },
    },
  },
};
