/* routes.ts */
import { Router, Status } from 'https://deno.land/x/oak/mod.ts'
// status codes: https://deno.land/std@0.84.0/http/http_status.ts
// import { upload } from 'https://cdn.deno.land/oak_upload_middleware/versions/v2/raw/mod.ts'

import { getRequestInfo } from '../../modules/util.ts'

// imported routers
import withAccountRouter from './accountRouter.ts'
import withPackageRouter from './packageRouter.ts'

const VERSION_URI = '/v1'

const withV1Router = (router: Router) => {
  router.get(`${VERSION_URI}/`, context => {
    const host = context.request.url.host
  
    const data = getRequestInfo("default", host);
  
    context.response.headers.set('Allow', data.allows);
  
    context.response.status = Status.OK
    context.response.body = JSON.stringify(data, null, 2)
  })

  // add external routes
  withAccountRouter(router)
  withPackageRouter(router)
}

export default withV1Router
