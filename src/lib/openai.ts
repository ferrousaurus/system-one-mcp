import type { TypesafeRequestBody } from "#ferrousaurus/system-one-mcp/data/request.ts";
import type { TypesafeResponseBody } from "#ferrousaurus/system-one-mcp/data/toolOutput.ts";

export default async function openai(
  _input: Readonly<TypesafeRequestBody>,
): Promise<TypesafeResponseBody> {
  throw new Error(
    "The OpenAI tool is not implemented yet. Please use the 'typesafe' tool instead.",
  );
}
