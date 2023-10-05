// helpers/mongodbHelper.ts

import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';

export class MongodbHelper {
  private static mongod: MongoMemoryServer;
  private static mongoConnection: Connection;

  static async start(): Promise<void> {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    this.mongoConnection = (await connect(uri)).connection;
  }

  static async stop(): Promise<void> {
    await this.mongoConnection.dropDatabase();
    await this.mongoConnection.close();
    await this.mongod.stop();
  }

  static getUri(): string {
    return this.mongod.getUri();
  }
}
