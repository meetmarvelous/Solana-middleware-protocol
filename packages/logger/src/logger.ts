import { LogEvent } from "@repo/types";

export function logEvent(event: LogEvent, logs?: LogEvent[]) {
    console.log(JSON.stringify(event));
    if (logs) logs.push(event);
}