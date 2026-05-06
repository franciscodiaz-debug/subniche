import { LogLayer, type PluginBeforeMessageOutParams } from "loglayer";
import { PinoTransport } from "@loglayer/transport-pino";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";
import { serializeError } from "serialize-error";
import { pino } from "pino";

const isServer = typeof window === "undefined";

const pinoLogger = pino({ level: "trace" });

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    getSimplePrettyTerminal({
      enabled: process.env.NODE_ENV === "development",
      runtime: isServer ? "node" : "browser",
      viewMode: "inline",
    }),
    new PinoTransport({
      enabled: process.env.NODE_ENV === "production",
      logger: pinoLogger,
    }),
  ],
  plugins: [
    {
      onBeforeMessageOut(params: PluginBeforeMessageOutParams) {
        const tag = isServer ? "Server" : "Client";
        if (params.messages && params.messages.length > 0) {
          if (typeof params.messages[0] === "string") {
            params.messages[0] = `[${tag}] ${params.messages[0]}`;
          }
        }
        return params.messages;
      },
    },
  ],
});

log.withContext({ isServer });

export function getLogger() {
  return log;
}
