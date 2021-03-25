import { Router, Status } from 'https://deno.land/x/oak/mod.ts'

import { register, getUserList } from './modules/accounts.ts'
import { getRequestInfo, verifyToken } from './modules/util.ts'

const withAccountRouter = (VERSION: string, router: Router) => {

  const SUB_ROUTE=`/${VERSION}/accounts`

  router 
    .get(SUB_ROUTE, async context => {
      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      console.log('-fetching info')
      // get info from file
      const info = getRequestInfo(VERSION, "accounts")
      context.response.headers.set('Allow', info.allows)
    
      try {
        console.log('-extracting details')
        
        if(!token) throw new Error("Invalid token")
        // verify token - throws error
        const userDetails = await verifyToken(token)
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
    .post(SUB_ROUTE, async context => {
      // get info from file
      const info = getRequestInfo(VERSION, "accounts")
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
    // get list of all couriers
    .get(`${SUB_ROUTE}/couriers`, async context => {
      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      console.log('-fetching info')
      // get info from file
      const info = getRequestInfo(VERSION, "accounts/couriers")
      context.response.headers.set('Allow', info.allows)
    
      try {
        console.log('-extracting details')
        
        if(!token) throw new Error("Invalid token")
        // verify token - throws error
        await verifyToken(token)

        // get list of users
        const couriers = await getUserList("courier");

        console.log('-responding...')
        // set response status
        context.response.status = Status.OK
    
        // create response msg
        const msg = {
          info,
          status: 'success',
          data: {couriers}
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

export default withAccountRouter