import express from 'express';
import logger from 'morgan';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { Socket } from 'node:dgram';
//import dotenv from 'dotenv';

const port = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);
const historial = [];
const usuariosConectados = [];

io.on('connection', (socket) => {
  console.log('a user has connected');

  socket.emit('historial', historial);

  socket.emit('usuariosConectados', usuariosConectados);

  socket.on('disconnect', () => {
    io.emit('new user message', {
      usuario: socket.handshake.auth.username,
      login: false,
    });
    const indice = usuariosConectados.findIndex(
      (e) => e === socket.handshake.auth.username
    );
    usuariosConectados.splice(0, 1);
    console.log(`${socket.handshake.auth.username} has logout`);
  });

  socket.on('chat message', ({ msg, textColor, bgColor, usuario, tiempo }) => {
    io.emit('chat message', { msg, textColor, bgColor, usuario, tiempo });
    historial.push({ msg, usuario, tiempo, textColor, bgColor });
    // console.log(historial);
    console.log(usuariosConectados);
  });

  socket.on('new user message', ({ usuario, login, usuariosConectados }) => {
    io.emit('new user message', { usuario, login, usuariosConectados });
    console.log('mensaje de nuevo usuario: ' + usuario);
  });

  socket.on('usuario', (usuario) => {
    socket.handshake.auth.username = usuario;
    console.log('nuevo usuario: ' + usuario);
  });

  socket.on('list of users', ({ usuario }) => {
    if (usuariosConectados.includes(usuario)) {
      io.emit('puede conectar', false);
    } else {
      io.emit('puede conectar', true);
      usuariosConectados.push(usuario);
      io.emit('list of users', usuariosConectados);
      console.log(usuariosConectados);
    }
  });
});

app.use(logger('dev'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
