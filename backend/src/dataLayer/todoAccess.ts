import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('todoAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable: string = process.env.TODOS_TABLE,
    private readonly createdAtIndex: string = process.env.CREATED_AT_INDEX
  ) { }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting todo items', { userId: userId })
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
    return result.Items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating a todo item', { todoId: todoItem.todoId })
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()
    return todoItem
  }

  async updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<void> {
    logger.info('Updating todo item', { todoId: todoId })
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': updateTodoRequest.name,
        ':dueDate': updateTodoRequest.dueDate,
        ':done': updateTodoRequest.done,
      },
      ExpressionAttributeNames: {
        "#name": "name"
      }
    }).promise()
  }

  async updateAttachmentUrl(todoId: string, userId: string): Promise<void> {
    logger.info('Updating attachment URL', { todoId: todoId })
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': getAttachmentUrl(todoId)
      }
    }).promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info('Deleting todo item', { todoId: todoId })
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        'userId': userId,
        'todoId': todoId
      }
    }).promise()
  }

  async isValidTodoItem(todoId: string, userId: string): Promise<boolean> {
    logger.info('Validating todo item', { todoId: todoId, userId: userId })
    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
    logger.info('Getting todo item', result)
    return !!result.Item
  }
}

function createDynamoDBClient(): DocumentClient {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new AWS.DynamoDB.DocumentClient()
}

function getAttachmentUrl(todoId: string): string {
  const attachmentsBucket: string = process.env.ATTACHMENTS_S3_BUCKET
  return process.env.IS_OFFLINE ? `http://localhost:8001/${attachmentsBucket}/${todoId}` : `https://${attachmentsBucket}.s3.amazonaws.com/${todoId}`
}