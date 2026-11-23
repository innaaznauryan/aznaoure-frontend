import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/api/client";

describe("apiFetch token refresh", () => {
  beforeEach(() => {
    localStorage.setItem("aznaoure_token", "expired-access");
    localStorage.setItem("aznaoure_refresh_token", "valid-refresh");
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("refreshes once and retries the failed request with the new access token", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "new-access" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await apiFetch("/api/users/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ refresh_token: "valid-refresh" });
    expect(new Headers(fetchMock.mock.calls[2][1].headers).get("Authorization")).toBe("Bearer new-access");
    expect(localStorage.getItem("aznaoure_token")).toBe("new-access");
  });
});