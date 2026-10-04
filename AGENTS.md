# Repository guide

## Toolchain and verification

- Use Node 26 and Nub 0.7.5. `nub.lock` is the lockfile; use `nub ci` or `nub install`, not npm, pnpm, or yarn.
- Run the same checks as CI in this order: `nub run format:check`, `nub run lint`, `nub run typecheck`, then `nub run test:coverage`.
- Run one focused test with `nub exec vitest run src/tools/ask.test.ts` (replace the path as needed). Coverage enforces 100% for lines, functions, branches, and statements.
- There is no build step. `nub run start` runs the stdio MCP server directly from `src/index.ts`.

## Environment and generated files

- Varlock validates environment variables. Change `.env.schema`, then run `nub run codegen` (or `nub exec varlock codegen`) to regenerate `env.d.ts`; never edit `env.d.ts` directly.
- Keep `API_KEY` in an ignored `.env*` file. `.env.schema` is tracked and must not contain a real key. The schema defaults `API_BASE_URL` to `https://api.typesafe.ai/v1/systemone`, `API_PROVIDER` to `typesafe`, and `LOG_TOOL_CALLS` to `true`.
- `nub run start` requires `API_KEY`; it makes an upstream request only when the `ask` tool is called.

## Architecture and constraints

- `src/index.ts` registers the tools and connects `StdioServerTransport`; keep stdout reserved for MCP traffic.
- `src/tools/ask.ts` selects `src/lib/typesafe.ts` or `src/lib/openai.ts` from `API_PROVIDER`. The OpenAI provider is currently a deliberate unimplemented stub.
- `src/lib/typesafe.ts` posts to `API_BASE_URL` and validates the request-correlated response. Keep `src/data/request.ts`, `src/data/response.ts`, and `src/data/toolOutput.ts` aligned when changing question or answer shapes.
- Preserve explicit `.ts` import extensions and the `#ferrousaurus/system-one-mcp/*` package alias; both are required by the TypeScript and package configuration.
- Tests live beside source files under `src/**/*.test.ts`; shared typed fixtures are in `test/fixtures.ts` and use the `#ferrousaurus/system-one-mcp-test/*` alias.
