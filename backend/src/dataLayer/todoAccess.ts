import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('todoAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) { }

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting todo items', { userId: userId })
    const result = await this.docClient.query({
      TableName: this.todosTable,
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