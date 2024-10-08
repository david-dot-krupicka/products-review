import dotenv from "dotenv";
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

import express from "express";
import bodyParser from "body-parser";

import * as expressWinston from "express-winston";
import * as http from "http";
import * as winston from "winston";

//import cors from "cors";
import debug from "debug";

import { CommonRoutesConfig } from "./common/common.routes.config";
import { AuthRoutesConfig } from "./auth/auth.routes.config";
import { UsersRoutesConfig } from "./users/users.routes.config";
import { ProductReviewsRoutesConfig } from "./product-reviews/product-reviews.routes.config";

const app: express.Application = express(),
      port = "8080",
      routes: CommonRoutesConfig[] = [],
      server: http.Server = http.createServer(app),
      debugLog: debug.IDebugger = debug("app");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// here we are adding middleware to parse all incoming requests as JSON
app.use(express.json());

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
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

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

// here we are adding the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app!
routes.push(new AuthRoutesConfig(app));
routes.push(new UsersRoutesConfig(app));
routes.push(new ProductReviewsRoutesConfig(app));

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at http://localhost:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

server.listen(port, () => {
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
    // our only exception to avoiding console.log(), because we
    // always want to know when the server is done starting up
    console.log(runningMessage);
});

export { app, server };
