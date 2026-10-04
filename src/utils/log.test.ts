import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { output, request } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

const appendFile = vi.fn<(path: string, data: string) => Promise<void>>();

const importLog = async (logToolCalls: boolean) => {
  vi.doMock("varlock/env", () => ({
    ENV: {
      LOG_TOOL_CALLS: logToolCalls,
    },
  }));
  vi.doMock("fs/promises", () => ({
    appendFile,
  }));

  const module = await import("#ferrousaurus/system-one-mcp/utils/log.ts");
  return module.default;
};

describe("tool call logger", () => {
  beforeEach(() => {
    vi.resetModules();
    appendFile.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing when logging is disabled", async () => {
    const log = await importLog(false);

    await log({ input: request, output });

    expect(appendFile).not.toHaveBeenCalled();
  });

  it("writes successful tool calls when logging is enabled", async () => {
    const log = await importLog(true);

    await log({ input: request, output });

    expect(appendFile).toHaveBeenCalledWith(
      "~/.local/share/system-one-mcp/history.jsonl",
      JSON.stringify({ input: request, output }),
    );
  });

  it("writes errors without their cause", async () => {
    const log = await importLog(true);
    const cause = new Error("underlying error");
    const error = new Error("tool failed", { cause });

    await log({ input: request, error });

    expect(appendFile).toHaveBeenCalledWith(
      "~/.local/share/system-one-mcp/history.jsonl",
      JSON.stringify({
        error: {},
        input: request,
      }),
    );
  });
});
