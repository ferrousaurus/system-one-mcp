import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import registerAsk from "./tools/ask.ts";

const server = new McpServer({
  name: "system-one-mcp",
  version: "1.0.0",
  description: "A Model Context Protocol server for System One.",
});

async function main() {
  registerAsk(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
