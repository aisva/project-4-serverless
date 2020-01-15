// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '...'
//export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`
export const apiEndpoint = "http://localhost:3003"

export const authConfig = {
  domain: 'dev-qfv-c16y.auth0.com',
  clientId: 'jqaEOhbogqWwNlrDh7kPD2FT3meUy6Ag',
  callbackUrl: 'http://localhost:3000/callback'
}
