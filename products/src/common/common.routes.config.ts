import express from "express";

export abstract class CommonRoutes {
    protected name: string;
    protected app: express.Application;

    protected constructor(app: express.Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }

    public getName() {
        return this.name;
    }

    protected abstract configureRoutes(): express.Application;
}
