import amqp from 'amqplib';
import {IMessageBroker} from "../../interfaces/message-broker.interface";

export class RabbitMQPublisher implements IMessageBroker {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    constructor(private readonly url: string) {
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log("Connected to RabbitMQ");
        } catch (error) {
            console.error("Error connecting to RabbitMQ", error);
        }
    }

    async publish(queue: string, message: any): Promise<void> {
        if (!this.channel) {
            throw new Error("Channel is not open");
        }

        await this.channel.assertQueue(queue, {durable: false});
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }

    async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }

    isConnected(): boolean {
        return this.connection !== null;
    }
}