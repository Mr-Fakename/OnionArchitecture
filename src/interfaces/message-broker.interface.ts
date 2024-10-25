export interface IMessageBroker {
    publish: (queue: string, message: any) => Promise<void>;
    isConnected: () => boolean;
    connect: () => Promise<void>;
    close: () => Promise<void>;
}