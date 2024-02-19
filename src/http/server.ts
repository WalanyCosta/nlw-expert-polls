import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import { pollResults } from './ws/poll-results'
import { fastifyWebsocket } from '@fastify/websocket'

const app = fastify()

app.register(cookie, {
    secret: "polls-app-nlw",
    hook: 'onRequest'
})

app.register(fastifyWebsocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(pollResults)

app.listen({ port: 3333 }).then(()=>{
    console.log('Http server running!')
})