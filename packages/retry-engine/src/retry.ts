export type RetryFailureKind =
    | "BLOCKHASH_EXPIRED"
    | "RPC_ERROR"
    | "CONFIRMATION_FAILED"
    | "TRANSACTION_REJECTED"
    | "UNKNOWN";

export type RetryState = {
    attempt: number;
    status: "started" | "failed" | "retrying" | "succeeded" | "exhausted";
    reason?: RetryFailureKind;
    error?: unknown;
};

export type RetryOptions = {
    maxRetries: number;
    delayMs?: number;
    shouldRetry?: (error: unknown, state: RetryState) => boolean;
    classifyFailure?: (error: unknown) => RetryFailureKind;
    onStateChange?: (state: RetryState) => void;
};

const retryableFailures = new Set<RetryFailureKind>([
    "BLOCKHASH_EXPIRED",
    "RPC_ERROR",
    "CONFIRMATION_FAILED",
]);

function defaultClassifyFailure(error: unknown): RetryFailureKind {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("blockhash") || message.includes("expired")) return "BLOCKHASH_EXPIRED";
    if (message.includes("timeout") || message.includes("rpc") || message.includes("fetch")) return "RPC_ERROR";
    if (message.includes("confirm")) return "CONFIRMATION_FAILED";
    if (message.includes("reject")) return "TRANSACTION_REJECTED";
    return "UNKNOWN";
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeWithRetry<T>(
    operation: (state: RetryState) => Promise<T>,
    options: RetryOptions
): Promise<{ result: T; attempts: number; states: RetryState[] }> {
    if (!Number.isInteger(options.maxRetries) || options.maxRetries < 0) {
        throw new Error("maxRetries must be a non-negative integer");
    }

    const states: RetryState[] = [];
    const emit = (state: RetryState) => {
        states.push(state);
        options.onStateChange?.(state);
    };

    const classifyFailure = options.classifyFailure ?? defaultClassifyFailure;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
        const started: RetryState = { attempt, status: "started" };
        emit(started);

        try {
            const result = await operation(started);
            emit({ attempt, status: "succeeded" });
            return { result, attempts: attempt + 1, states };
        } catch (error) {
            const reason = classifyFailure(error);
            const failed: RetryState = { attempt, status: "failed", reason, error };
            emit(failed);

            const shouldRetry = options.shouldRetry?.(error, failed) ?? retryableFailures.has(reason);
            if (!shouldRetry || attempt === options.maxRetries) {
                emit({ attempt, status: "exhausted", reason, error });
                throw error;
            }

            emit({ attempt: attempt + 1, status: "retrying", reason });
            if (options.delayMs) {
                await sleep(options.delayMs);
            }
        }
    }

    throw new Error("Retry loop exhausted unexpectedly");
}
