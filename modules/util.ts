
/* util.ts */

import { HandlebarsConfig } from 'https://deno.land/x/handlebars/mod.ts'
import { Base64 } from 'https://deno.land/x/bb64/mod.ts'

import { loginConfig } from './accounts.ts'

export const handlebarsConfig: HandlebarsConfig = {
	baseDir: 'views',
	extname: '.hbs',
	layoutsDir: 'layouts/',
	partialsDir: 'partials/',
	defaultLayout: '',
	helpers: undefined,
	compilerOptions: undefined,
}

export function extractCredentials(token: string): loginConfig {
	console.log('checkAuth')
	if(token === undefined) throw new Error('no auth header')
	const [type, hash] = token.split(' ')
	console.log(`${type} : ${hash}`)
	if(type !== 'Basic') throw new Error('wrong auth type')
	const str = atob(hash)
	console.log(str)
	if(str.indexOf(':') === -1) throw new Error('invalid auth format')
	const [username, password] = str.split(':')
	console.log(username)
	console.log(password)
	return { username, password }
}

export function saveFile(base64String: string, username: string): void {
	console.log('save file')
	let [ metadata, base64Image ] = base64String.split(';base64,')
	console.log(metadata)
	const extension = metadata.split('/').pop()
	console.log(extension)
	const filename = `${username}-${Date.now()}.${extension}`
	console.log(filename)
	Base64.fromBase64String(base64Image).toFile(`./static/uploads/${filename}`)
	console.log('file saved')
}

// // checks if file exists
// async function fileExists(path: string): boolean {
//   try {
//     const stats = await Deno.lstat(path)
//     return stats && stats.isFile
//   } catch(e) {
//     if (e && e instanceof Deno.errors.NotFound) {
//       return false
//     } else {
//       throw e
//     }
//   }
// }
