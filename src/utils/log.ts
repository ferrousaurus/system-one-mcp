import * as fs from "fs/promises";
import { ENV } from "varlock/env";
import type { Input } from "../data/toolInput.ts";
import type { TypesafeResponseBody } from "../data/toolOutput.ts";

export type LogLine = { input: Input } & ({ error: Error } | { output: TypesafeResponseBody });

const redactInput = (input: Input) => {
  return input;
};

const redactError = (error: Error) => {
  return error;
};

const redactOutput = (output: TypesafeResponseBody) => {
  return output;
};

const log = ENV.LOG_TOOL_CALLS
  ? async (line: Readonly<LogLine>) => {
      const home = process.env.HOME;
      if (home === undefined) {
        return;
      }
      const directory = `${home}/.local/share/system-one-mcp`;
      const file = `${directory}/history.jsonl`;
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(file, "", { flag: "a" });

      const { input, ...noninput } = line;
      if ("error" in noninput) {
        const { error, ...rest } = noninput;
        return await fs.appendFile(
          file,
          `${JSON.stringify({ input: redactInput(input), error: redactError(error), ...rest })}\n`,
        );
      }
      const { output, ...rest } = noninput;
      return await fs.appendFile(
        file,
        `${JSON.stringify({ input: redactInput(input), output: redactOutput(output), ...rest })}\n`,
      );
    }
  : ((async (_line) => {}) satisfies (_line: Readonly<LogLine>) => Promise<void>);

export default log;
