import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import mongoose from 'mongoose';
import {values} from 'lodash';

/**
 * Starting point for an application.
 */
export default class App {
  constructor(models, config) {
    this.models = models;
    this.config = config;

    // Setup express and socket.io
    this.app = express();
    this.server = http.Server(this.app);
    this.io = SocketIO(this.server);
    this.config.express(this.app);

    this.io.on('connection', socket => {
      console.log('[socket.io]', 'Client connected');
      this.socket = socket;
      this.setSocket(this.socket, this.config.sockets.emitOn);
    });

  }

  listen(port) {
    this.server.listen(port, () => {
      let {address, port} = this.server.address();
      console.log('[express]', 'Listening @ ', address + ':' + port);

      this.ioClient = SocketIOClient.connect('ws://' + address + ':' + port);

      this.connectMongo(address, 'test');
    });
    return this;
  }

  connectMongo(host, db, options={}) {
    let uri = ['mongodb://', host, '/', db].join('');
    mongoose.connect(uri, options, () => {
      console.log('[mongoose]', 'Connected to', uri);
    });
  }

  /**
   * Add a new socket to all models.
   * @param  {Object} socket  Socket.io instance.
   * @param  {Object} [emitOn]  Emit events on mongoose hooks.
   */
  setSocket(socket, emitOn) {
    values(this.models).forEach(model => model.setSocket(socket, emitOn));
  }
}
