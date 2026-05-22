import { SendWithReliability, type SendraOptions, type SendraParams, type Signer } from "sendra-tx";
import type { Network } from "@repo/types";

export function createSendraExample(params: SendraParams, signer: Signer, network: Network = "devnet") {
  const options: SendraOptions = {
    maxRetries: 3,
    logger: (event) => {
      console.log(`[${event.step}]`, event.message ?? event.rpc ?? "");
    },
  };

  return SendWithReliability(params, signer, options, network);
}
