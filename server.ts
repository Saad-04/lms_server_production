import { connectDb } from "./utils/db";
import { v2 as cloudinary } from 'cloudinary'
import { app } from "./app";
import { config } from 'dotenv'
import http from 'http'
import { initSocketServer } from "./socketServer";
const server = http.createServer(app)
// const cloudinary = require('cloudinary').v2;

// const { app } = require("./app");

config()
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
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
// this is socket server 
initSocketServer(server)

// connect to server 
server.listen(process.env.PORT, () => {
    console.log('server started on ', process.env.PORT);

    // connect database 
    connectDb();
})

