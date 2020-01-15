import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-qfv-c16y.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', { token: event.authorizationToken })
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const response = await Axios.get(jwksUrl)
  if (response == null || response.data == null || response.data.keys == null) throw new Error('Unable to fetch JWKS')
  const keyList = response.data.keys;
  if (keyList == null || keyList.length === 0) throw new Error('Invalid JWKS')
  const signingKeys = keyList.filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid === jwt.header.kid && key.x5c && key.x5c.length);
  if (signingKeys == null || signingKeys.length === 0) throw new Error('Unable to find a signing key')
  const certificate = signingKeys[0].x5c[0]
  verify(token, certificateToPEM(certificate), { algorithms: ['RS256'] })
  return jwt.payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// Copyright (c) 2017 Shawn Meyer https://github.com/sgmeyer/auth0-node-jwks-rs256/blob/master/src/lib/utils.js
function certificateToPEM(certificate): string {
  certificate = certificate.match(/.{1,64}/g).join('\n');
  certificate = `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----\n`;
  return certificate;
}