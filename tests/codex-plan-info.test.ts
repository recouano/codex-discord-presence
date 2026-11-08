import { test, expect, vi } from "vitest";
import { readFile } from "node:fs/promises";
vi.mock("node:fs/promises", () => ({ readFile: vi.fn() }));
import { getCodexPlanName, planName } from "../src/codex/plan-info.ts";

test("known plan types render without the ChatGPT prefix", () => {
  expect(planName("pro")).toBe("Pro 20X");
  expect(planName("prolite")).toBe("Pro 5X");
  expect(planName("pro_lite")).toBe("Pro 5X");
  expect(planName("plus")).toBe("Plus");
  expect(planName("go")).toBe("Go");
  expect(planName("team")).toBe("Team");
  expect(planName("business")).toBe("Business");
  expect(planName("self_serve_business_usage_based")).toBe("Business");
  expect(planName("enterprise")).toBe("Enterprise");
  expect(planName("edu")).toBe("Edu");
  expect(planName("free")).toBe("Free");
});

test("case insensitive", () => {
  expect(planName("PRO")).toBe("Pro 20X");
});

test("unknown and missing return undefined", () => {
  expect(planName("mystery")).toBeUndefined();
  expect(planName(undefined)).toBeUndefined();
});

test("auth access is opt-in, including after a plan has been cached", async () => {
  const read = vi.mocked(readFile);
  read.mockResolvedValue(JSON.stringify({ tokens: { id_token:
    `header.${Buffer.from(JSON.stringify({ "https://api.openai.com/auth": { chatgpt_plan_type: "plus" } })).toString("base64url")}.signature`
  } }));
  expect(await getCodexPlanName("/private/codex")).toBeUndefined();
  expect(read).not.toHaveBeenCalled();
  expect(await getCodexPlanName("/private/codex", true)).toBe("Plus");
  expect(read).toHaveBeenCalledTimes(1);
  expect(await getCodexPlanName("/private/codex", false)).toBeUndefined();
  expect(read).toHaveBeenCalledTimes(1);
});
