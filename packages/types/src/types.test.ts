import { describe, expectTypeOf, it } from "vitest";
import type { Network, SendraOptions, SendraParams, TxStatus } from "./index";

describe("@repo/types public contracts", () => {
    it("restricts network and status values at compile time", () => {
        expectTypeOf<Network>().toEqualTypeOf<"mainnet" | "devnet">();
        expectTypeOf<TxStatus>().toEqualTypeOf<"pending" | "confirmed" | "failed">();
    });

    it("models params and built transaction inputs as a discriminated union", () => {
        expectTypeOf<Extract<SendraParams, { type: "params" }>>().toHaveProperty("amount").toEqualTypeOf<number>();
        expectTypeOf<Extract<SendraParams, { type: "built"; serializedTx: true }>>()
            .toHaveProperty("transaction")
            .toEqualTypeOf<Uint8Array>();
    });

    it("requires explicit retry configuration for SDK calls", () => {
        expectTypeOf<SendraOptions>().toHaveProperty("maxRetries").toEqualTypeOf<number>();
    });
});
