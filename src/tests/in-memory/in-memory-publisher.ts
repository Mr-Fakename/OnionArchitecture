import {IMessageBroker} from "../../interfaces/message-broker.interface";

export class InMemoryPublisher implements IMessageBroker {
    private messages: {queue: string, message: any}[] = [];

    async publish(queue: string, message: any): Promise<void> {
        this.messages.push({queue, message});
    }

    getMessages(queue: string): any[] {
        return this.messages
            .filter(m => m.queue === queue)
            .map(m => m.message
        );
    }

    clearMessages(): void {
        this.messages = [];
    }

    isConnected(): boolean {
        return true;
    }

    async connect(): Promise<void> {
    }

    async close(): Promise<void> {
    }
}