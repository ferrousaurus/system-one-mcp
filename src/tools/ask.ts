import { typesafeRequestBodySchema } from "#ferrousaurus/system-one-mcp/data/request.ts";
import { typesafeResponseBodySchema } from "#ferrousaurus/system-one-mcp/data/toolOutput.ts";
import openai from "#ferrousaurus/system-one-mcp/lib/openai.ts";
import typesafe from "#ferrousaurus/system-one-mcp/lib/typesafe.ts";
import type { McpServer } from "@modelcontextprotocol/server";
import { ENV } from "varlock/env";
import log from "../utils/log.ts";

const isTypesafeModel = (model: string) => model.startsWith("jev-")

const api = isTypesafeModel(ENV.MODEL) ? typesafe : openai;

export default function registerAsk(server: McpServer) {
  server.registerTool(
    "ask",
    {
      description: "Evaluate focused semantic judgments against shared state. Use choice to select from defined options, score to rate ordered criteria, or noul to estimate whether a statement is true. Batch independent questions that use the same state; each is evaluated separately. Returns typed answers with probabilities and confidence where applicable. Not for open-ended text generation or multi-step reasoning.",
      inputSchema: typesafeRequestBodySchema.omit({ model: true }),
      outputSchema: typesafeResponseBodySchema,
    },
    async (input) => {
      const inputWithModel = { ...input, model: ENV.MODEL }

      try {
        const output = await api(inputWithModel);

        log({ input: inputWithModel, output });

        return {
          content: [{ type: "text", text: JSON.stringify(output) }],
          structuredContent: output,
        };
      } catch (e) {
        log({
          input: inputWithModel,
          error: e instanceof Error ? e : new Error("An error occurred.", { cause: e }),
        });

        throw e;
      }
    },
  );
}
