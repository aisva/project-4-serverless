import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { TodoItem } from "../models/TodoItem"
import * as uuid from 'uuid'
import { TodoAccess } from "../dataLayer/todoAccess"
import { createLogger } from '../utils/logger'

const logger = createLogger('todoBusinessLogic')

const todoAccess = new TodoAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info('Getting todo items', { userId: userId })
  return todoAccess.getTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId: string = uuid.v4()
  logger.info('Creating a todo item', { todoId: todoId, userId: userId })
  return await todoAccess.createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}