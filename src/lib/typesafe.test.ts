import { request, response } from "#ferrousaurus/system-one-mcp-test/fixtures.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const importTypesafe = async () => {
  vi.doMock("varlock/env", () => ({
    ENV: {
      API_BASE_URL: "https://example.test/systemone",
      API_KEY: "test-key",
    },
  }));

  const module = await import("#ferrousaurus/system-one-mcp/lib/typesafe.ts");
  return module.default;
};

describe("typesafe provider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends the request and validates the response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    const typesafe = await importTypesafe();

    await expect(typesafe(request)).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith("https://example.test/systemone", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  });

  it("reports HTTP errors with an empty body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 503 }));
    const typesafe = await importTypesafe();

    await expect(typesafe(request)).rejects.toThrow(
      "An HTTP 503 error occurred while fetching the answers.",
    );
  });

  it("reports HTTP errors with a response body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("upstream failure", { status: 500 }));
    const typesafe = await importTypesafe();

    await expect(typesafe(request)).rejects.toThrow(
      "An HTTP 500 error occurred while fetching the answers (upstream failure)",
    );
  });

  it("reports invalid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("{invalid json", { status: 200 }));
    const typesafe = await importTypesafe();

    await expect(typesafe(request)).rejects.toThrow(
      "An error occurred while deserializing the answers:",
    );
  });

  it("reports an invalid response body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ model: "jev" }), { status: 200 }),
    );
    const typesafe = await importTypesafe();

    await expect(typesafe(request)).rejects.toThrow(
      "An error occurred while validating the answers:",
    );
  });
});
