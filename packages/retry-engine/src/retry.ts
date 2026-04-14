// import type { DeserializedTx } from "@repo/types"
// import { BuildTx } from "@repo/tx-builder";
// import { SendTx } from "@repo/rpc-client"
// import { optimizeFee } from "@repo/fee-optimizer";
// import { selectRpc } from "@repo/router";
// export async function retryTx(tx: DeserializedTx, fee: number) {
//     console.log("Called retryTx");
//     const bestRPC = await selectRpc();
//     const newTx = await BuildTx(bestRPC, tx, fee);
//     const optimize = await optimizeFee(newTx, bestRPC, fee);
//     const signature = await SendTx(optimize.transaction, bestRPC);
//     return {
//         tx: optimize.transaction,
//         signature,
//         fee: optimize.fee
//     };
// }