import { MongoDBContainer } from "@testcontainers/mongodb";
import type { TestProject } from "vitest/node";

declare module "vitest" {
    export interface ProvidedContext {
        mongoUri: string;
    }
}

export default async function setup(project: TestProject) {
    const container = await new MongoDBContainer("mongo:8.0").start();
    project.provide("mongoUri", container.getConnectionString());

    return async () => {
        await container.stop();
    };
}
