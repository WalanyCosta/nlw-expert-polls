import { prisma } from './../../config/prisma';
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:pollId', async (request, reply) =>{
        const getPollParams = z.object({ 
            pollId: z.string().uuid()
        })
        const { pollId } = getPollParams .parse(request.params)

        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId
            },
            include: {
                PollOption: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })
        
        return reply.send({ poll })
    })
}