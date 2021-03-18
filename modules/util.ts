
/* util.ts */

import { Base64 } from 'https://deno.land/x/bb64/mod.ts'

import { loginConfig, requestInfo, requestLinks } from '../interfaces/request_interfaces.ts'

const requests = JSON.parse(Deno.readTextFileSync('./requests.json'));

export function extractCredentials(token: string): loginConfig {
	console.log('checkAuth')
	if(token === undefined) throw new Error('no auth header')
	const [type, hash] = token.split(' ')
	console.log(`${type} : ${hash}`)
	if(type !== 'Basic') throw new Error('wrong auth type, requires Basic')
	const str = atob(hash)
	console.log(str)
	if(str.indexOf(':') === -1) throw new Error('invalid auth format')
	const [username, password] = str.split(':')
	console.log(username)
	console.log(password)
	return { username, password }
}

export function getRequestInfo(request: string, host?: string): requestInfo {
  // get base info
  const info: requestInfo = requests[request];

  // customise links to include host - if they exist
  if(info.links) {
    for(const link of info.links) {
      link.href = host + link.href;
    }
  }
  return info;
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
