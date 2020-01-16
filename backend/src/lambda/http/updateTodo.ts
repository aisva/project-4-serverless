import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { isValidTodoItem, updateTodo } from '../../businessLogic/todo'
import { getUserId } from '../utils'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
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
  await updateTodo(updatedTodoRequest, todoId, userId)
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