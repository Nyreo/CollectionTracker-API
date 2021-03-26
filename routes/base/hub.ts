/* routes.ts */

// base file for listing version information -- imports all version routers

import { Router, Status } from 'https://deno.land/x/oak/mod.ts'

import { getRequestInfo } from './modules/util.ts'

// version routers
import withV1Router from '../v1/hub.ts'
import withV2Router from '../v2/hub.ts'
import withV3Router from '../v3/hub.ts'

const router: Router = new Router()

router.get(`/`, context => {
	const host = context.request.url.host

  const data = getRequestInfo("v0", "default", host);

  context.response.headers.set('Allow', data.allows);

	context.response.status = Status.OK
	context.response.body = JSON.stringify(data, null, 2)
})

// v3
withV3Router(router)
// v2
withV2Router(router)
// v1
withV1Router(router)


// default route to 404 not found
router.get(`/(.*)`, context => {     
	context.response.body = JSON.stringify({ status: '404 not found' }, null, 2)
})


export default router