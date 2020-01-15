import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodos } from '../../businessLogic/todo'
import { getUserId } from '../utils'

const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todos = await getTodos(getUserId(event))
  return {
    statusCode: 201,
    body: JSON.stringify({
      items: todos
    })
  }
})

handler.use(
  cors()
)
