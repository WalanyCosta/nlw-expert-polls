import { prisma } from './../../config/prisma';
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function createPoll(app: FastifyInstance) {
    app.post('/polls', async (request, reply) =>{
        const createPoolBody = z.object({ 
            title: z.string(),
            options: z.array(z.string())
        })
        const { title, options } = createPoolBody.parse(request.body)

        const poll = await prisma.poll.create({
            data:{
                title,
                PollOption: {
                    createMany:{
                        data: options.map( option => {
                            return { title: option }
                        }) 
                    }
                }
            }
        })
        
        return reply.status(200).send({ pollId: poll.id })
    })
}