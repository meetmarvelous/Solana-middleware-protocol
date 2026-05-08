import { LogEvent } from "@repo/types";

const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    bgGreen: "\x1b[42m",
    bgRed: "\x1b[41m",
    bgYellow: "\x1b[43m",
};

function getTimestamp(): string {
    return new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function getStepColor(step: string): string {
    if (step.includes("CONFIRMED")) return c.green;
    if (step.includes("SUCCESS")) return c.green;
    if (step.includes("FAILED") || step.includes("EXCEEDED")) return c.red;
    if (step.includes("RETRY") || step.includes("ATTEMPT") || step.includes("BLOCKHASH") || step.includes("ACTION")) return c.yellow;
    return c.cyan;
}

function formatEventForConsole(event: LogEvent): string {
    const ts = `${c.gray}[${getTimestamp()}]${c.reset}`;
    const stepColor = getStepColor(event.step);
    const stepTag = `${stepColor}${c.bold}[${event.step}]${c.reset}`;

    const lines: string[] = [`${ts} ${stepTag}`];

    switch (event.step) {
        case "RPC_SELECTED":
            lines.push(`${c.dim}  → Selected fastest RPC${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → ${c.white}${event.rpc}${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "TX_BUILT":
            lines.push(`${c.dim}  → Transaction constructed${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → RPC: ${c.white}${event.rpc}${c.reset}`);
            break;

        case "TX_LOADED":
            lines.push(`${c.dim}  → Pre-built transaction loaded${c.reset}`);
            break;

        case "FEE_OPTIMIZED":
            lines.push(`${c.dim}  → Dynamic priority fee applied${c.reset}`);
            if (event.fee !== undefined) lines.push(`${c.dim}  → Fee: ${c.white}${event.fee} micro-lamports${c.reset}`);
            break;

        case "FEE_REOPTIMIZED":
            lines.push(`${c.yellow}  → Fee re-optimized for retry${c.reset}`);
            if (event.fee !== undefined) lines.push(`${c.dim}  → New fee: ${c.white}${event.fee} micro-lamports${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "SIMULATION_SUCCESS":
            lines.push(`${c.green}  ✓ Simulation passed — transaction is valid${c.reset}`);
            break;

        case "SIMULATION_FAILED":
            lines.push(`${c.red}  ✗ Simulation failed — transaction would revert${c.reset}`);
            if (event.message) lines.push(`${c.dim}  → ${event.message}${c.reset}`);
            break;

        case "RETRY_SIMULATION_SUCCESS":
            lines.push(`${c.green}  ✓ Retry simulation passed${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "RETRY_SIMULATION_FAILED":
            lines.push(`${c.red}  ✗ Retry simulation failed${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "TX_SIGNED":
            lines.push(`${c.dim}  → Transaction signed by wallet${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → RPC: ${event.rpc}${c.reset}`);
            break;

        case "TX_SENT":
            lines.push(`${c.dim}  → Transaction broadcast to network${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → RPC: ${event.rpc}${c.reset}`);
            break;

        case "TX_CONFIRMED":
            lines.push(`${c.green}${c.bold}  ═══ ✓ Transaction Confirmed On-Chain ═══${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → RPC: ${event.rpc}${c.reset}`);
            break;

        case "TX_CONFIRMED_AFTER_RETRY":
            lines.push(`${c.green}${c.bold}  ═══ ✓ Confirmed after retry ═══${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Total attempts: ${event.attempt}${c.reset}`);
            break;

        case "TX_NOT_CONFIRMED":
            lines.push(`${c.yellow}  → Transaction not confirmed — will retry${c.reset}`);
            break;

        case "ATTEMPT_FAILED":
            lines.push(`${c.yellow}  → Initial attempt failed${c.reset}`);
            if (event.message) lines.push(`${c.dim}  → ${event.message}${c.reset}`);
            break;

        case "RETRY_ATTEMPT":
            lines.push(`${c.yellow}${c.bold}  ↻ Retry attempt #${event.attempt || "?"}${c.reset}`);
            lines.push(`${c.dim}  → Re-routing through pipeline${c.reset}`);
            break;

        case "BLOCKHASH_EXPIRED":
            lines.push(`${c.yellow}  → Blockhash expired — rebuilding transaction${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "SEND_FAILED":
            lines.push(`${c.red}  ✗ Send failed${c.reset}`);
            if (event.message) lines.push(`${c.dim}  → ${event.message}${c.reset}`);
            break;

        case "RETRY_FAILED_REASON":
            lines.push(`${c.yellow}  → Failure classified: ${c.white}${event.message || "unknown"}${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Attempt ${event.attempt}${c.reset}`);
            break;

        case "ACTION":
            const actionMap: Record<string, string> = {
                REBUILD_TX: "Rebuilding transaction with fresh blockhash",
                SWITCH_RPC: "Switching to different RPC endpoint",
                INCREASE_FEE: "Increasing priority fee to beat congestion",
            };
            lines.push(`${c.magenta}  → ${actionMap[event.message || ""] || event.message || ""}${c.reset}`);
            break;

        case "MAX_RETRIES_EXCEEDED":
            lines.push(`${c.red}${c.bold}  ✗ Maximum retries exceeded — transaction failed${c.reset}`);
            if (event.attempt !== undefined) lines.push(`${c.dim}  → Total attempts: ${event.attempt}${c.reset}`);
            break;

        default:
            if (event.message) lines.push(`${c.dim}  → ${event.message}${c.reset}`);
            if (event.rpc) lines.push(`${c.dim}  → RPC: ${event.rpc}${c.reset}`);
            break;
    }

    return lines.join("\n");
}

export function logEvent(
    event: LogEvent,
    logs?: LogEvent[],
    logger?: (log: LogEvent) => void
) {
    // Always append to logs array if provided
    if (logs) logs.push(event);

    // Always print formatted output to console — never skip this
    console.log(formatEventForConsole(event));

    // Also call custom logger callback if provided (for dashboard UI streaming)
    if (logger) logger(event);
}