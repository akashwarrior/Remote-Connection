import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { UserManager } from './manager/UserManager';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const userManager = new UserManager();

io.on('connection', (socket) => {
  if (socket.handshake.query.type) {
    userManager.addSender(socket);
  } else {
    userManager.addReceiver(socket);
  }

  socket.on('disconnect', function () {
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log('server running at port: 3000');
});