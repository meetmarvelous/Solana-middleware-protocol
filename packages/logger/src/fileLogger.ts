import { LogEvent } from "@repo/types";

export class FileLogger {
    private stream: any = null;
    private filepath: string = "";
    private startTime: number = 0;

    constructor() {
        this.startTime = Date.now();
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
            try {
                const nodeRequire = eval("require");
                const fs = nodeRequire("fs");
                const path = nodeRequire("path");

                const logDir = path.join(process.cwd(), "sendra-logs");
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }

                const date = new Date();
                const pad = (n: number) => n.toString().padStart(2, "0");
                const formattedDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                const formattedTime = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
                const fileName = `sendra-tx-${formattedDate}T${formattedTime}.log`;

                this.filepath = path.join(logDir, fileName);
                this.stream = fs.createWriteStream(this.filepath, { flags: "a" });
            } catch (e) {
                // Ignore errors
            }
        }
    }

    private getTimestamp(): string {
        const date = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    log(event: LogEvent) {
        if (!this.stream) return;

        const ts = `[${this.getTimestamp()}]`;
        const step = `[${event.step}]`;
        let output = `${ts} ${step}\n`;

        switch (event.step) {
            case "RPC_SELECTED":
                if (event.rpc) output += `RPC: ${event.rpc}\n`;
                if (event.latency !== undefined) output += `Latency: ${event.latency}ms\n`;
                if (event.attempt !== undefined) output += `Attempt: ${event.attempt}\n`;
                break;
            case "TX_BUILT":
            case "TX_LOADED":
                if (event.rpc) output += `RPC: ${event.rpc}\n`;
                break;
            case "FEE_OPTIMIZED":
                if (event.fee !== undefined) output += `Initial Fee: ${event.fee}\n`;
                break;
            case "FEE_REOPTIMIZED":
                if (event.fee !== undefined) output += `New Fee: ${event.fee}\n`;
                if (event.attempt !== undefined) output += `Attempt: ${event.attempt}\n`;
                break;
            case "SIMULATION_SUCCESS":
            case "SIMULATION_FAILED":
            case "RETRY_SIMULATION_SUCCESS":
            case "RETRY_SIMULATION_FAILED":
                if (event.message) output += `Message: ${event.message}\n`;
                if (event.attempt !== undefined) output += `Attempt: ${event.attempt}\n`;
                break;
            case "TX_SIGNED":
            case "TX_SENT":
            case "TX_NOT_CONFIRMED":
            case "BLOCKHASH_EXPIRED":
            case "SEND_FAILED":
            case "ATTEMPT_FAILED":
                if (event.rpc) output += `RPC: ${event.rpc}\n`;
                if (event.attempt !== undefined) output += `Attempt: ${event.attempt}\n`;
                if (event.message) output += `Message: ${event.message}\n`;
                break;
            case "RETRY_ATTEMPT":
                if (event.attempt !== undefined) {
                    output = `${ts} [RETRY_ATTEMPT #${event.attempt}]\n`;
                }
                if (event.message) {
                    output += `Reason: ${event.message}\n`;
                }
                break;
            case "ACTION":
                output += `${event.message}\n`;
                break;
            case "RETRY_FAILED_REASON":
                output += `Reason: ${event.message}\n`;
                if (event.attempt !== undefined) output += `Attempt: ${event.attempt}\n`;
                break;
            case "TX_CONFIRMED":
            case "TX_CONFIRMED_AFTER_RETRY":
                if (event.message) {
                    output += `Signature: ${event.message}\n`;
                    output += `Explorer Link: https://explorer.solana.com/tx/${event.message}${event.rpc?.includes("devnet") ? "?cluster=devnet" : ""}\n`;
                }
                if (event.attempt !== undefined) output += `Total Attempts: ${event.attempt}\n`;
                if (event.rpc) output += `RPC: ${event.rpc}\n`;
                break;
            case "MAX_RETRIES_EXCEEDED":
                if (event.attempt !== undefined) output += `Total Attempts: ${event.attempt}\n`;
                break;
            default:
                if (event.message) output += `Message: ${event.message}\n`;
                if (event.rpc) output += `RPC: ${event.rpc}\n`;
                break;
        }

        output += "\n";
        try {
            this.stream.write(output);
        } catch (e) {
            // Ignore write errors
        }

        if (
            event.step === "TX_CONFIRMED" ||
            event.step === "TX_CONFIRMED_AFTER_RETRY" ||
            event.step === "MAX_RETRIES_EXCEEDED" ||
            event.step === "SIMULATION_FAILED" ||
            event.step === "RETRY_SIMULATION_FAILED"
        ) {
            this.close();
        }
    }

    close() {
        if (!this.stream) return;
        const totalTime = Date.now() - this.startTime;
        try {
            this.stream.write(`[${this.getTimestamp()}] [EXECUTION_COMPLETED]\nTotal Execution Time: ${totalTime}ms\n`);
            this.stream.end();
            this.stream = null;
        } catch (e) {
            // Ignore write errors
        }
    }
}
