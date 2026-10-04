import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { output, request } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";

const importAsk = async (
  provider: "typesafe" | "openai",
  openaiError: unknown = new Error("OpenAI provider error"),
) => {
  vi.doMock("varlock/env", () => ({
    ENV: {
      API_PROVIDER: provider,
    },
  }));

  const typesafe = vi
    .fn<(input: typeof request) => Promise<typeof output>>()
    .mockResolvedValue(output);
  const openai = vi.fn<(input: typeof request) => Promise<never>>().mockImplementation(async () => {
    throw openaiError;
  });
  const log = vi.fn<(line: unknown) => void>();
  vi.doMock("#ferrousaurus/system-one-mcp/lib/typesafe.ts", () => ({
    default: typesafe,
  }));
  vi.doMock("#ferrousaurus/system-one-mcp/lib/openai.ts", () => ({
    default: openai,
  }));
  vi.doMock("#ferrousaurus/system-one-mcp/utils/log.ts", () => ({
    default: log,
  }));

  const module = await import("#ferrousaurus/system-one-mcp/tools/ask.ts");
  return {
    registerAsk: module.default,
    typesafe,
    openai,
    log,
  };
};

const registerAndGetHandler = async (provider: "typesafe" | "openai", openaiError?: unknown) => {
  const server = new McpServer({
    name: "test-server",
    version: "1.0.0",
  });
  const registerTool = vi.spyOn(server, "registerTool");
  const imported = await importAsk(provider, openaiError);
  imported.registerAsk(server);
  const call = registerTool.mock.calls[0];

  if (!call) {
    throw new Error("The ask tool was not registered.");
  }

  return {
    ...imported,
    config: call[1],
    handler: call[2],
  };
};

describe("ask tool registration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers and invokes the typesafe provider", async () => {
    const { config, handler, log, typesafe } = await registerAndGetHandler("typesafe");

    expect(config).toMatchObject({
      description: "Ask a collection of questions.",
    });
    // @ts-expect-error The handler does not use the MCP context in this unit test.
    await expect(handler(request, undefined)).resolves.toEqual({
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output,
    });
    expect(typesafe).toHaveBeenCalledWith(request);
    expect(log).toHaveBeenCalledWith({ input: request, output });
  });

  it("registers and invokes the openai provider", async () => {
    const { handler, log, openai } = await registerAndGetHandler("openai");

    // @ts-expect-error The handler does not use the MCP context in this unit test.
    await expect(handler(request, undefined)).rejects.toThrow("OpenAI provider error");
    expect(openai).toHaveBeenCalledWith(request);
    expect(log).toHaveBeenCalledWith({
      input: request,
      error: expect.any(Error),
    });
  });

  it("rethrows non-Error provider failures", async () => {
    const { handler, log } = await registerAndGetHandler("openai", "provider failure");

    // @ts-expect-error The handler does not use the MCP context in this unit test.
    await expect(handler(request, undefined)).rejects.toBe("provider failure");
    expect(log).toHaveBeenCalledWith({
      input: request,
      error: expect.objectContaining({ message: "An error occurred." }),
    });
  });
});
