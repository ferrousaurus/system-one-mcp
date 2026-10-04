import type { TypesafeRequestBody } from "#ferrousaurus/system-one-mcp/data/request.ts";
import { correlatedResponseBodySchema } from "#ferrousaurus/system-one-mcp/data/response.ts";
import { ENV } from "varlock/env";

export default async function typesafe(input: Readonly<TypesafeRequestBody>) {
  const response = await fetch(ENV.API_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text();

    const message =
      text === ""
        ? `An HTTP ${response.status} error occurred while fetching the answers.`
        : `An HTTP ${response.status} error occurred while fetching the answers (${text}).`;

    throw new Error(message);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`An error occurred while deserializing the answers: ${JSON.stringify(error)}`);
  }

  const validated = correlatedResponseBodySchema(input).safeParse(data);

  if (!validated.success) {
    throw new Error(
      `An error occurred while validating the answers: ${JSON.stringify(validated.error)}`,
    );
  }

  return validated.data;
}
