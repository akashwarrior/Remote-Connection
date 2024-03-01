import { Socket } from "socket.io";

export class UserManager {
    private senders: Map<string, Socket>;
    private receivers: Map<string, Socket>;

    constructor() {
        this.senders = new Map();
        this.receivers = new Map();
    }

    addSender(socket: Socket) {
        this.senders.set(socket.id, socket);
        this.clearQueue();
    }

    addReceiver(socket: Socket) {
        this.receivers.set(socket.id, socket);
        this.clearQueue();
    }

    removeUser(socketId: string) {
        this.senders.delete(socketId);
        this.receivers.delete(socketId);
    }

    clearQueue() {
        if (this.receivers.size < 1 || this.senders.size < 1) {
            return;
        }

        const sender = this.senders.values().next().value;
        const receiver = this.receivers.values().next().value;

        if (!sender || !receiver) {
            return;
        }

        sender.emit("send-offer");

        sender.on("offer", ({ sdp }: { sdp: string }) => {
            receiver.emit("offer", { sdp });
        });

        receiver.on("answer", ({ sdp }: { sdp: string }) => {
            sender.emit("answer", { sdp });
        });

        receiver.on("add-ice-candidate", ({ candidate }: { candidate: String }) => {
            sender.emit("add-ice-candidate", { candidate });
        });
    }
}