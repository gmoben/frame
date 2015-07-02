import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import SocketIOClient from 'socket.io-client';
import mongoose from 'mongoose';
import {values} from 'lodash';


export default class App {
  /**
   * Initalize express application and socket.io.
   * @param  {object} models Models to use.
   * @param  {object} config Configuration to use.
   */
  constructor(models, config) {
    this.models = models;
    this.config = config;

    /**
     * @member {express.Application} app
     * @member {http.Server} server
     * @member {socketio.Server} io
     */
    this.app = express();
    this.server = http.Server(this.app);
    this.io = SocketIO(this.server);

    this.config.express(this.app);

    this.io.on('connection', socket => {
      console.log('[socket.io]', 'Client connected');
      this.socket = socket;
      let emitOn = this.config.socket ? this.config.socket.emitOn : undefined;
      this.setSocket(this.socket, emitOn);
    });
  }

  /**
   * Listen to incoming requests.
   * @param  {number} port      Server port
   * @param  {string} hostname  Server hostname
   * @return {Promise.<Object>} {address, port}
   */
  listen(port, hostname='localhost') {
    return new Promise((resolve, reject) => {
      this.server.listen(port, hostname, () => {
        let {address, port} = this.server.address();
        let uri = address + ':' + port;
        console.log('[express]', 'Listening @ ', uri);

        /** @member {socket.io-client.Manager} */
        this.ioClient = SocketIOClient('ws://' + uri);

        this.connectMongo(address, 'test');
        resolve({address, port});
      });
    });
  }

  /**
   * Close the server.
   * @return {Promise.<string>} Success message
   */
  close() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        delete this[ioClient];
        let msg = 'Successfully closed server.';
        console.log(msg);
        resolve(msg);
      });
    });
  }

  /**
   * Connect mongoose to mongodb instance.
   * @param {string} hostname   Host name
   * @param {string} db='test'  Database name
   * @param {Object} [options]  Options for `mongoose.connect`
   * @return {Promise.<string>} Success message.
   */
  connectMongo(hostname, db, options={}) {
    new Promise((resolve, reject) => {
      if (!hostname || !db) { throw new errors.AppError(); }
      let uri = ['mongodb://', hostname, '/', db].join('');
      mongoose.connect(uri, options, err => {
        if (err) reject(err);
        let msg = 'Connected to ' + uri;
        console.log('[mongoose]', msg);
        resolve(msg);
      });
    });
  }

  /**
   * Add a new socket to all models.
   * @param  {socketio.Socket} socket    Socket.io instance.
   * @param  {Object} [emitOn]  Emit events on mongoose hooks.
   */
  setSocket(socket, emitOn) {
    values(this.models).forEach(model => model.setSocket(socket, emitOn));
  }
}
