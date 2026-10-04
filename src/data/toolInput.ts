import { z } from "zod";
import { typesafeRequestBodySchema } from "./request.ts";

const inputSchema = typesafeRequestBodySchema;

export type Input = z.infer<typeof inputSchema>;
