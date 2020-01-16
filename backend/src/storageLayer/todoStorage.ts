import { createLogger } from '../utils/logger'
import * as AWS from 'aws-sdk'

const logger = createLogger('todoStorage')

export class TodoStorage {
  constructor(
    private readonly s3: AWS.S3 = createS3(),
    private readonly attachmentsBucket: string = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly signedUrlExpiration: string = process.env.SIGNED_URL_EXPIRATION
  ) { }

  getUploadUrl(todoId: string) {
    logger.info('Getting upload URL', { todoId: todoId })
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.attachmentsBucket,
      Key: todoId,
      Expires: this.signedUrlExpiration
    })
  }
}

function createS3(): AWS.S3 {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local S3 instance')
    return new AWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      endpoint: 'http://localhost:8001',
      signatureVersion: 'v4'
    })
  }
  return new AWS.S3({
    signatureVersion: 'v4'
  })
}