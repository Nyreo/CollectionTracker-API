
/* util.ts */

import { Base64 } from 'https://deno.land/x/bb64/mod.ts'

import { loginConfig, requestInfo, requestLinks } from '../interfaces/request_interfaces.ts'
import { login } from './accounts.ts';

const baseRequests = JSON.parse(Deno.readTextFileSync('./routes/base/requests.json'));
const v1Requests = JSON.parse(Deno.readTextFileSync('./routes/v1/requests.json'));
const v2Requests = JSON.parse(Deno.readTextFileSync('./routes/v2/requests.json'));
const v3Requests = JSON.parse(Deno.readTextFileSync('./routes/v3/requests.json'));

const requests: Record<string, Record<string, requestInfo>> = {
  "v0": baseRequests,
  "v1": v1Requests,
  "v2": v2Requests,
  "v3": v3Requests,
}

export function extractCredentials(token: string): loginConfig {
	console.log('-checking auth')
	if(token === undefined) throw new Error('no auth header')
	const [type, hash] = token.split(' ')
  console.log('\tFound auth')
	if(type !== 'Basic') throw new Error('wrong auth type, requires Basic')
  console.log('\tCorrect type')
	const str = atob(hash)
	if(str.indexOf(':') === -1) throw new Error('invalid auth format')
  console.log('\tCorrect format')
	const [username, password] = str.split(':')
	return { username, password }
}

export function getRequestInfo(VERSION: string, request: string, host?: string): requestInfo {
  // get base info
  const info: requestInfo = requests[VERSION][request];

  // customise links to include host - if they exist
  if(info.links) {
    for(const link of info.links) {
      link.href = host + link.href;
    }
  }
  return info;
}

// check token by loggin in -- returns user details
export async function verifyToken(token: string) {
  const credentials = extractCredentials(token!)
  console.log(`credentials: ${JSON.stringify(credentials)}`)

  console.log('-fetching userDetails')

  const userDetails = await login(credentials)
  console.log(`username: ${userDetails.username}`)
  console.log(`type: ${userDetails.userType}`)
  
  return userDetails
}

export function saveFile(base64String: string, username: string): void {
	console.log('save file')
	const [ metadata, base64Image ] = base64String.split(';base64,')
	console.log(metadata)
	const extension = metadata.split('/').pop()
	console.log(extension)
	const filename = `${username}-${Date.now()}.${extension}`
	console.log(filename)
	Base64.fromBase64String(base64Image).toFile(`./static/uploads/${filename}`)
	console.log('file saved')
}
