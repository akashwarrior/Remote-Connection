"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
class UserManager {
    constructor() {
        this.senders = new Map();
        this.receivers = new Map();
    }
    addSender(socket) {
        this.senders.set(socket.id, socket);
        this.clearQueue();
    }
    addReceiver(socket) {
        this.receivers.set(socket.id, socket);
        this.clearQueue();
    }
    removeUser(socketId) {
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
        sender.on("offer", ({ sdp }) => {
            receiver.emit("offer", { sdp });
        });
        receiver.on("answer", ({ sdp }) => {
            sender.emit("answer", { sdp });
        });
        receiver.on("add-ice-candidate", ({ candidate }) => {
            sender.emit("add-ice-candidate", { candidate });
        });
    }
}
exports.UserManager = UserManager;
