import { prisma } from './../../config/prisma';
import { FastifyInstance } from 'fastify'
import { object, z } from 'zod'
import { redis } from '../../config/redis';

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

        if(!poll){
            return reply.status(400).send({message: 'Poll not found.'})
        }

        const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

        const votes = result.reduce((obj, line, index) => {
            if(index % 2 === 0){
                const score = result[index + 1]

                Object.assign(obj, { [line]: Number(score) })
            }

            return obj
        }, {} as Record<string, number>)
        
        return reply.send({
            poll: {
                id: poll.id,
                title: poll.title,
                options: poll.PollOption.map(option => {
                    return {
                        id: option.id,
                        title: option.title,
                        score: (option.id in votes) ? votes[option.id] : 0
                    }
                })
            }
        })
    })
}