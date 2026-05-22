export type MockRpcBehavior = {
  blockhashes?: Array<{ blockhash: string; lastValidBlockHeight: number }>;
  blockHeight?: number | (() => number);
  failBlockhash?: boolean;
  sendSignatures?: string[];
  sendErrors?: Error[];
  signatureStatuses?: Array<{
    value?: {
      err?: unknown;
      confirmationStatus?: "processed" | "confirmed" | "finalized";
    } | null;
  }>;
  simulationErrors?: unknown[];
  prioritizationFees?: number[];
  latencyMs?: number;
};

export function createRpcBehavior(overrides: MockRpcBehavior = {}): Required<MockRpcBehavior> {
  return {
    blockhashes: overrides.blockhashes ?? [{ blockhash: "mock-blockhash", lastValidBlockHeight: 100 }],
    blockHeight: overrides.blockHeight ?? 1,
    failBlockhash: overrides.failBlockhash ?? false,
    sendSignatures: overrides.sendSignatures ?? ["mock-signature"],
    sendErrors: overrides.sendErrors ?? [],
    signatureStatuses: overrides.signatureStatuses ?? [{ value: { confirmationStatus: "confirmed" } }],
    simulationErrors: overrides.simulationErrors ?? [null],
    prioritizationFees: overrides.prioritizationFees ?? [100, 200, 300],
    latencyMs: overrides.latencyMs ?? 0,
  };
}

export function nextOrLast<T>(items: T[]): T {
  if (items.length === 0) throw new Error("Mock queue is empty");
  return items.length === 1 ? items[0]! : items.shift()!;
}
