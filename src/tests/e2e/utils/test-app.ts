import express, { Application } from "express";
import { errorHandlerMiddleware } from "../../../app/middlewares/error-handler.middleware";
import { jsonResponseMiddleware } from "../../../app/middlewares/json-response.middleware";
import { ConferenceRoutes } from "../../../app/routes/conference.routes";
import { IFixture } from "./fixture.interface";
import { container, ResolveDependency } from "../../../infrastructure/config/dependency-injection";

export class TestApp {
    private app: Application
    private container: ResolveDependency

    constructor() {
        this.app = express()
        this.container = container
    }

    async setup() {
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(jsonResponseMiddleware)
        this.app.use(ConferenceRoutes)
        this.app.use(errorHandlerMiddleware)
    }

    async loadFixtures(fixtures: IFixture[]) {
        return Promise.all(fixtures.map(fixture => fixture.load(this.container)))
    }

    get expressApp() {
        return this.app
    }
}