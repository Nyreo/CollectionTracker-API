/* routes.ts */

// base file for listing version information

import { Router, Status } from 'https://deno.land/x/oak/mod.ts'

import { getRequestInfo } from '../../modules/util.ts'

const router: Router = new Router()

router.get(`/`, context => {
	const host = context.request.url.host

  const data = getRequestInfo("default", host);

  context.response.headers.set('Allow', data.allows);

	context.response.status = Status.OK
	context.response.body = JSON.stringify(data, null, 2)
})

// default route to 404 not found
router.get(`/(.*)`, context => {     
	context.response.body = JSON.stringify({ status: '404 not found' }, null, 2)
})

export default router