import { randomUUID } from 'crypto';
import { prisma } from './../../config/prisma';
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function voteOnPoll(app: FastifyInstance) {
    app.post('/polls/:pollId/votes', async (request, reply) =>{
        const votePollBody = z.object({ 
            pollOptionId: z.string().uuid()
        })

        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollId } = voteOnPollParams.parse(request.params)
        const { pollOptionId } = votePollBody.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(sessionId){
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId:{
                        sessionId,
                        pollId
                    }
                }
            })

            if(userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id,
                    }
                })
            }else if(userPreviousVoteOnPoll){
                return reply.status(400).send({ message: 'You already voted on this poll.' })
            }
        }

        if(!sessionId){

         sessionId = randomUUID()
       
         reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            signed: true,
            httpOnly: true,
         })
        }

        

        await prisma.vote.create({
            data: {
                 sessionId,
                 pollId,
                 pollOptionId
            }
        })

        return reply.status(200).send()
    })
}
    

