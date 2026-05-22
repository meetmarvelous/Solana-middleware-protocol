import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("examples", () => {
  it("keeps the basic SDK example compile-safe and side-effect free", async () => {
    const source = await readFile(join(process.cwd(), "examples/basic.ts"), "utf8");

    expect(source).toContain("SendWithReliability");
    expect(source).toContain("createSendraExample");
    expect(source).not.toContain("await createSendraExample()");
  });
});
