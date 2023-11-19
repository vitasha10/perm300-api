import Fastify from "fastify"
import cors from "@fastify/cors"
import multipart from "@fastify/multipart"

import pkg from 'pg'
export const pool = new pkg.Pool({
    user: 'perm300',
    host: 'perm300api-postgres',
    database: 'perm300',
    password: 'perm300',
    port: 5432,
})

const fastify = Fastify({
    logger: true,
    exposeHeadRoutes: true
})
await fastify.register(cors, {
    origin: "*"
})
await fastify.register(multipart, {
    limits: {
        fieldNameSize: 1000, // Max field name size in bytes
        fieldSize: 1000,     // Max field value size in bytes
        fields: 100,         // Max number of non-file fields
        fileSize: 1024*1024*1024*5,  // For multipart forms, the max file size in bytes
        files: 100,           // Max number of file fields
        headerPairs: 200000,  // Max number of header key=>value pairs
        parts: 1000000000         // For multipart forms, the max number of parts (fields + files)
    }
})

fastify.get('/', async function handler (request, reply) {
    return { hello: 'world' }
})

fastify.get('/initQuestRooms', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            CREATE TABLE IF NOT EXISTS quest_rooms (
                id BIGSERIAL PRIMARY KEY,
                userid TEXT,
                data TEXT
        );`, (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e: e})
                return;
            }
            resolve({status: "success"})
        })
    })
})

//получить отзывы по теплоходу
fastify.get('/getQuestRooms', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            SELECT data FROM quest_rooms
            WHERE userid=$1;
        `, [String(request.query.userId)], (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e, results})
                return;
            }
            if(results.rowCount === 0) {
                resolve({status: "success", rows: []})
                return;
            }
            resolve({status: "success", rows: results.rows.map(item => item.data)})
        })
    })
})

//добавить ссылку слайдера
fastify.post('/addQuestRooms', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            SELECT data FROM quest_rooms
            WHERE userid=$1 AND data=$2;
        `, [request.body.userId, request.body.data], (e2, results2) => {
            if(results2.rowCount === 0){
                pool.query(`
                    INSERT INTO quest_rooms
                    (userid, data) VALUES ($1,$2);
                `, [request.body.userId, request.body.data], (e, results) => {
                    if (e) {
                        console.log(e)
                        resolve({status: "error", e: e})
                        return;
                    }
                    resolve({status: "success"})
                })
                return
            }else{
                resolve({status: "success"})
            }
        })
    })
})
//удалить ссылку слайдера
fastify.post('/removeQuestRooms', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            DELETE FROM quest_rooms 
            WHERE userid=$1 AND data=$2;
        `, [request.body.userId, request.body.data], (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e: e})
                return;
            }
            resolve({status: "success"})
        })
    })
})

fastify.get('/initGuessedLocations', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            CREATE TABLE IF NOT EXISTS guessed_locations (
                id BIGSERIAL PRIMARY KEY,
                userid TEXT,
                data TEXT
        );`, (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e: e})
                return;
            }
            resolve({status: "success"})
        })
    })
})

//получить отзывы по теплоходу
fastify.get('/getGuessedLocations', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            SELECT data FROM guessed_locations
            WHERE userid=$1;
        `, [request.query.userId], (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e, results})
                return;
            }
            if(results.rowCount === 0) {
                resolve({status: "success", rows: []})
                return;
            }
            resolve({status: "success", rows: results.rows.map(item => item.data)})
        })
    })
})

//добавить ссылку слайдера
fastify.post('/addGuessedLocations', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            SELECT data FROM guessed_locations
            WHERE userid=$1 AND data=$2;
        `, [request.body.userId, request.body.data], (e2, results2) => {
            if(results2.rowCount === 0){
                pool.query(`
                    INSERT INTO guessed_locations
                    (userid, data) VALUES ($1,$2);
                `, [request.body.userId, request.body.data], (e, results) => {
                    if (e) {
                        console.log(e)
                        resolve({status: "error", e: e})
                        return;
                    }
                    resolve({status: "success"})
                })
                return
            }else{
                resolve({status: "success"})
            }
        })
    })
})
//удалить ссылку слайдера
fastify.post('/removeGuessedLocations', async (request, reply) => {
    return await new Promise(resolve => {
        pool.query(`
            DELETE FROM guessed_locations 
            WHERE userid=$1 AND data=$2;
        `, [request.body.userId, request.body.data], (e, results) => {
            if (e) {
                console.log(e)
                resolve({status: "error", e: e})
                return;
            }
            resolve({status: "success"})
        })
    })
})

import { Server } from "socket.io"

const io = new Server(4001, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log("connected")
    socket.emit("hello", "world")
    socket.on("changeBlocks", arg => {
        console.log(arg)
        socket.emit("changeBlocksServer", arg)
    })
    socket.on("moveMainPerson", arg => {
        console.log("m",arg)
        console.log(arg)
        io.sockets.emit("moveMainPersonServer", arg)
    })
})

const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }

}
start().then(r => {})