import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { TodoItem } from "../models/TodoItem"
import * as uuid from 'uuid'
import { TodoAccess } from "../dataLayer/todoAccess"
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { TodoStorage } from "../storageLayer/todoStorage"

const logger = createLogger('todoBusinessLogic')

const todoAccess = new TodoAccess()
const todoStorage = new TodoStorage()

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

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<void> {
  logger.info('Updating a todo item', { todoId: todoId, userId: userId })
  return todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function updateAttachmentUrl(todoId: string, userId: string): Promise<void> {
  logger.info('Updating attachment URL', { todoId: todoId })
  return todoAccess.updateAttachmentUrl(todoId, userId)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  logger.info('Deleting a todo item', { todoId: todoId, userId: userId })
  return todoAccess.deleteTodo(todoId, userId)
}

export async function isValidTodoItem(todoId: string, userId: string): Promise<boolean> {
  logger.info('Validating todo item', { todoId: todoId, userId: userId })
  return todoAccess.isValidTodoItem(todoId, userId);
}

export function getUploadUrl(todoId: string): string {
  logger.info('Getting upload URL', { todoId: todoId })
  return todoStorage.getUploadUrl(todoId);
}