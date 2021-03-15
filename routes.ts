
/* routes.ts */

import { Router, Status } from 'https://deno.land/x/oak/mod.ts'
// status codes: https://deno.land/std@0.84.0/http/http_status.ts
import { upload } from 'https://cdn.deno.land/oak_upload_middleware/versions/v2/raw/mod.ts'

import { login, loginConfig, register, registerConfig } from './modules/accounts.ts'
import { extractCredentials, saveFile } from './modules/util.ts'

const router: Router = new Router()

// the routes defined here
router.get('/', async context => {
	const host: string = `https://${context.request.url.host}`
	context.response.headers.set('Allow', 'GET')
	const data = {
		name: 'REST API Template',
		desc: 'a simple template for developing REST APIs',
		links: [
			{
				name: 'accounts',
				desc: 'a list of user accounts',
				href: `https://${host}/accounts`,
			}
		]
	}
	context.response.status = Status.OK
	context.response.body = JSON.stringify(data, null, 2)
})

router.get('/accounts', async context => {
	console.log('GET /accounts')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	context.response.headers.set('Allow', 'GET, POST')
	const info = {
		name: 'accounts',
		desc: 'a list of user accounts',
		schema: {
			username: 'string',
			password: 'string'
		},
	}
	try {
		if(!token) throw new Error('no token found')
		const credentials = extractCredentials(token)
		console.log(credentials)
		const username = await login(credentials)
		console.log(`username: ${username}`)
		context.response.status = Status.OK
		const msg = {
			info,
			status: 'success',
			data: { username }
		}
		context.response.body = JSON.stringify(msg, null, 2)
	} catch(err) {
		context.response.status = Status.Unauthorized
		const msg = {
			info,
			status: 'Unauthorized',
			msg: 'This route requires Basic Access Authentication',
			err: err.message
		}
		context.response.body = JSON.stringify(msg, null, 2)
	}
})

router.post('/accounts', async context => {
	console.log('POST /accounts')
	context.response.headers.set('Allow', 'GET, POST')
	const info = {
		name: 'accounts',
		desc: 'a list of user accounts',
		schema: {
			username: 'string',
			password: 'string'
		},
	}
	try {
		const body  = await context.request.body()
		const data = JSON.parse(await body.value)
		console.log(data)
		await register(data)
		context.response.status = Status.Created
		const msg = {
			info,
			status: 'Created',
			msg: 'account created',
			data: {
				username: data.username
			}
		}
		context.response.body = JSON.stringify(msg, null, 2)
	} catch(err) {
		context.response.status = Status.Conflict
		const msg = {
			info,
			status: 'Conflict',
			msg: 'there was a problem creating the account',
			err: err.message
		}
		context.response.body = JSON.stringify(msg, null, 2)
	}
})

router.post('/files', async context => {
	console.log('POST /files')
	try {
		const token = context.request.headers.get('Authorization')
		console.log(`auth: ${token}`)
		const body  = await context.request.body()
		const data = await body.value
		console.log(data)
		saveFile(data.base64, data.user)
		context.response.status = 201
		context.response.body = JSON.stringify({ status: 'success', msg: 'file uploaded' })
	} catch(err) {
		context.response.status = 401
		context.response.body = JSON.stringify({ status: 'unauthorised', msg: err.msg })
	}
})

router.get("/(.*)", async context => {     
	context.response.body = JSON.stringify({ status: '404 not found' }, null, 2)
})

export default router
