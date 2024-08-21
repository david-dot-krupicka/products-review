import express from "express";

import * as expressWinston from "express-winston";
import * as http from "http";
import * as winston from "winston";
import debug from "debug";

import ReviewsService from "./services/reviews.service";

const app: express.Application = express(),
      port = "8002",
      //routes: CommonRoutesConfig[] = [],
      server: http.Server = http.createServer(app),
      hostname: string = process.env["HOSTNAME"] || "",
      debugLog: debug.IDebugger = debug(`app-${hostname}`);

// Configure logging
const loggerOptions: expressWinston.LoggerOptions = {
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true }),
    ),
    transports: [new winston.transports.Console()],
};

if (!process.env.DEBUG) {
    loggerOptions.meta = false; // when not debugging, log requests as one-liners
    if (typeof global.it === "function") {
        loggerOptions.level = "http"; // for non-debug test runs, squelch entirely
    }
}

app.use(expressWinston.logger(loggerOptions));

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at http://${hostname}:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

server.listen(port, () => {
    console.log(runningMessage);
});

export { app, server };
