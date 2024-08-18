import express from "express";

import * as expressWinston from "express-winston";
import * as http from "http";
import * as winston from "winston";
import debug from "debug";

import ReviewsService from "./services/reviews.service";
/*
import { CommonRoutesConfig } from "./common/common.routes.config";
import { AuthRoutesConfig } from "./auth/auth.routes.config";
import { UsersRoutesConfig } from "./users/users.routes.config";
import { ProductReviewsRoutesConfig } from "./product-reviews/product-reviews.routes.config";
*/

const app: express.Application = express(),
      port = "8002",
      //routes: CommonRoutesConfig[] = [],
      server: http.Server = http.createServer(app),
      hostname: string = process.env["HOSTNAME"] || "",
      debugLog: debug.IDebugger = debug(`app-${hostname}`);

// here we are adding middleware to parse all incoming requests as JSON
//app.use(express.json());

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
/*
routes.push(new AuthRoutesConfig(app));
routes.push(new UsersRoutesConfig(app));
routes.push(new ProductReviewsRoutesConfig(app));
*/

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at http://${hostname}:${port}`;
app.get("/", (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

// TODO: We maybe do not need to listen
server.listen(port, () => {
    ReviewsService.logFromService().then(() => {
        debugLog("Done logging from ReviewsService");
    });
    //routes.forEach((route: CommonRoutesConfig) => {
    //    debugLog(`Routes configured for ${route.getName()}`);
    //});
    // our only exception to avoiding console.log(), because we
    // always want to know when the server is done starting up
    console.log(runningMessage);
});

export { app, server };
