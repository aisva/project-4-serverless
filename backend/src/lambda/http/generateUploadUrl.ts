import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { isValidTodoItem, getUploadUrl, updateAttachmentUrl } from '../../businessLogic/todo'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  const uploadUrl = getUploadUrl(todoId)
  await updateAttachmentUrl(todoId, userId)
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)