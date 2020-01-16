import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { isValidTodoItem, deleteTodo } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const validTodoItem: boolean = await isValidTodoItem(todoId, userId)
  if (!validTodoItem) {
    logger.error("Unable to fetch todo item", { todoId: todoId, userId: userId })
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Unable to fetch todo item'
      })
    }
  }
  await deleteTodo(todoId, userId)
  return {
    statusCode: 204,
    body: null
  }
})

handler.use(
  cors({
    credentials: true
  })
)
