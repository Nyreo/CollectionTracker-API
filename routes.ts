
/* routes.ts */

import { Router, Status } from 'https://deno.land/x/oak/mod.ts'
// status codes: https://deno.land/std@0.84.0/http/http_status.ts
import { upload } from 'https://cdn.deno.land/oak_upload_middleware/versions/v2/raw/mod.ts'

import { loginConfig, registerConfig } from './interfaces/request_interfaces.ts';

import { login, register } from './modules/accounts.ts'
import { extractCredentials, getRequestInfo, saveFile } from './modules/util.ts'

const router: Router = new Router()

router.get('/', context => {
	const host = context.request.url.host

  const data = getRequestInfo("default", host);

  context.response.headers.set('Allow', data.allows);

	context.response.status = Status.OK
	context.response.body = JSON.stringify(data, null, 2)
})

// fetch all accounts
router.get('/accounts', async context => {

	console.log('GET /accounts')
	
  // check if user has passed authroize header
  console.log('-fetching token')
  const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)

  console.log('-fetching info')
  // get info from file
  const info = getRequestInfo("accounts")
  context.response.headers.set('Allow', info.allows)

	try {
    console.log('-extracting details')
    // extra credentials from token
		const credentials = extractCredentials(token!)
		console.log(`credentials: ${JSON.stringify(credentials)}`)

    console.log('-fetching username')
    // get username from login
		const userDetails = await login(credentials)
		console.log(`username: ${userDetails.username}`)
    console.log(`type: ${userDetails.userType}`)
    
    console.log('-responding...')
    // set response status
		context.response.status = Status.OK

    // create response msg
		const msg = {
			info,
			status: 'success',
			data: userDetails
		}
		context.response.body = JSON.stringify(msg, null, 2)

	} catch(err) {
    // if error occured, set status to unauthorized, send message
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

// adding a new user to the collection
router.post('/accounts', async context => {
	console.log('POST /accounts')
	
  // get info from file
  const info = getRequestInfo("accounts")
  context.response.headers.set('Allow', info.allows)

	try {
		const body  = await context.request.body()
    const type = await body.type

    // check datatypes of submitted data
    const data = (type != 'json') ? JSON.parse(await body.value) : await body.value;

    // attempt to register the user
		await register(data)

    // set reponse status
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


// router.post('/files', async context => {
// 	console.log('POST /files')
// 	try {
// 		const token = context.request.headers.get('Authorization')
// 		console.log(`auth: ${token}`)
// 		const body  = await context.request.body()
// 		const data = await body.value
// 		console.log(data)
// 		saveFile(data.base64, data.user)
// 		context.response.status = 201
// 		context.response.body = JSON.stringify({ status: 'success', msg: 'file uploaded' })
// 	} catch(err) {
// 		context.response.status = 401
// 		context.response.body = JSON.stringify({ status: 'unauthorised', msg: err.msg })
// 	}
// })


// default route to 404 not found
router.get("/(.*)", context => {     
	context.response.body = JSON.stringify({ status: '404 not found' }, null, 2)
})

export default router
