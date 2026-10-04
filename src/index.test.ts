import { afterEach, describe, expect, it, vi } from "vitest";

describe("server entrypoint", () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("creates, registers, and connects the MCP server", async () => {
    const registerAsk = vi.fn<(server: object) => void>();
    const connect = vi.fn<(transport: object) => Promise<void>>().mockResolvedValue(undefined);
    const registerTool = vi.fn<(...args: unknown[]) => void>();
    const servers: Array<{
      connect: typeof connect;
      registerTool: typeof registerTool;
    }> = [];
    const transports: object[] = [];

    function createServer() {
      const server = { connect, registerTool };
      servers.push(server);
      return server;
    }

    function createTransport() {
      const transport = {};
      transports.push(transport);
      return transport;
    }

    vi.doMock("@modelcontextprotocol/server", () => ({
      McpServer: vi.fn<() => ReturnType<typeof createServer>>(createServer),
    }));
    vi.doMock("@modelcontextprotocol/server/stdio", () => ({
      StdioServerTransport: vi.fn<() => ReturnType<typeof createTransport>>(createTransport),
    }));
    vi.doMock("./tools/ask.ts", () => ({
      default: registerAsk,
    }));

    await import("./index.ts");
    await vi.waitFor(() => {
      expect(connect).toHaveBeenCalledOnce();
    });

    expect(servers).toHaveLength(1);
    expect(transports).toHaveLength(1);
    expect(registerAsk).toHaveBeenCalledWith(servers[0]);
    expect(connect).toHaveBeenCalledWith(transports[0]);
  });
});
