"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./utils/db");
const cloudinary_1 = require("cloudinary");
const app_1 = require("./app");
const dotenv_1 = require("dotenv");
const http_1 = __importDefault(require("http"));
const socketServer_1 = require("./socketServer");
const server = http_1.default.createServer(app_1.app);
// const cloudinary = require('cloudinary').v2;
// const { app } = require("./app");
(0, dotenv_1.config)();
// const { connectDb } = require('./utils/db')
// this is apollorserver 
// const { ApolloServer } = require('@apollo/server')
// const { startStandaloneServer } = require('@apollo/server/standalone')
// import { typeDefs } from './schema.js'
// require('dotenv').config()
// types
// server setup
// const server = new ApolloServer({
// })
// const { url } = await startStandaloneServer(server, {
//     listen: { port: 4000 }
// });
// console.log(`Server ready at: ${url}`)
// cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
// this is socket server 
(0, socketServer_1.initSocketServer)(server);
// connect to server 
server.listen(process.env.PORT, () => {
    console.log('server started on ', process.env.PORT);
    // connect database 
    (0, db_1.connectDb)();
});
