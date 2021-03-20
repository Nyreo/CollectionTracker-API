import { Router, Status } from 'https://deno.land/x/oak/mod.ts'

import { extractCredentials, getRequestInfo, verifyToken } from '../../modules/util.ts'

import { getPackages } from '../../modules/packages.ts';

const withPackageRouter = (router: Router) => {

  const SUB_ROUTE = '/packages'

  router
    .get(SUB_ROUTE, async context => {
      console.log(`GET ${SUB_ROUTE}`)

      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      // get info from file
      console.log('-fetching info')
      const info = getRequestInfo("accounts")
      context.response.headers.set('Allow', info.allows)
    
      try {
        // verify
        if(!token) throw new Error('Invalid token')
        await verifyToken(token)
        
        // get packages
        console.log('-getting packages')
        const packages = await getPackages();

        console.log('-responding')
        // set response status
        context.response.status = Status.OK
    
        // create response msg
        const msg = {
          info,
          status: 'success',
          data: packages
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
}

export default withPackageRouter