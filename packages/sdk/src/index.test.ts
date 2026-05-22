import { describe, expect, expectTypeOf, it, vi } from "vitest";

const state = vi.hoisted(() => ({
    SendWithReliability: vi.fn(),
}));

vi.mock("@repo/core", () => ({
    SendWithReliability: state.SendWithReliability,
}));

describe("sendra-tx SDK public API", () => {
    it("re-exports the core SendWithReliability implementation", async () => {
        const sdk = await import("./index");

        expect(sdk.SendWithReliability).toBe(state.SendWithReliability);
    });

    it("keeps public configuration types strict", async () => {
        const sdk = await import("./index");

        expectTypeOf<typeof sdk.SendWithReliability>().parameters.toMatchTypeOf<[
            import("@repo/types").SendraParams,
            import("@repo/types").Signer,
            import("@repo/types").SendraOptions,
            import("@repo/types").Network,
        ]>();
    });
});
