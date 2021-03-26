/* routes.ts */
import { Router, Status } from 'https://deno.land/x/oak/mod.ts'
// status codes: https://deno.land/std@0.84.0/http/http_status.ts
// import { upload } from 'https://cdn.deno.land/oak_upload_middleware/versions/v2/raw/mod.ts'

import { getRequestInfo } from './modules/util.ts'

// imported routers
import withAccountRouter from './accountRouter.ts'
import withPackageRouter from './packageRouter.ts'

const VERSION = "v3"

const withV3Router = (router: Router) => {
  router.get(`/${VERSION}`, context => {
    const host = context.request.url.host
  
    const data = getRequestInfo(VERSION, "default", host);
  
    context.response.headers.set('Allow', data.allows);
  
    context.response.status = Status.OK
    context.response.body = JSON.stringify(data, null, 2)
  })

  // add external routes
  withAccountRouter(VERSION, router)
  withPackageRouter(VERSION, router)
}

export default withV3Router
