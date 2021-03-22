import { Router, Status, helpers } from 'https://deno.land/x/oak/mod.ts'
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

import { extractCredentials, getRequestInfo, verifyToken } from '../../modules/util.ts'

import { getPackages, postPackage, patchPackage } from '../../modules/packages.ts';

const withPackageRouter = (router: Router) => {

  const SUB_ROUTE = '/packages'

  router
    // get all packages
    .get(SUB_ROUTE, async context => {
      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      // get info from file
      console.log('-fetching info')
      const info = getRequestInfo("packages")
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
    // add new package
    .post(SUB_ROUTE, async context => {

      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)

      // get info from file
      const info = getRequestInfo("packages")
      context.response.headers.set('Allow', info.allows)
    
      try {
        // verify
        if(!token) throw new Error('Invalid token')
        const {username} = await verifyToken(token)

        const body  = await context.request.body()
        const type = await body.type
    
        // check datatypes of submitted data
        const data = (type != 'json') ? JSON.parse(await body.value) : await body.value;
    
        // attempt to register the user
        console.log('-received package')

        // add inferred data
        data.username = username
        data.date = (new Date()).getTime()
        data.status = "not-dispatched"

        const _id = await postPackage(data)
    
        // set reponse status
        context.response.status = Status.Created
        const msg = {
          info,
          status: 'Created',
          msg: 'package added',
          data: {trackingNumber: _id}
        }
        context.response.body = JSON.stringify(msg, null, 2)
      } catch(err) {
        context.response.status = Status.NoContent
        const msg = {
          info,
          status: 'NoContent',
          msg: 'Could not add package',
          err: err.message
        }
        context.response.body = JSON.stringify(msg, null, 2)
      }
    })
    // packages by username
    .get<{username: string}>(`${SUB_ROUTE}/:username`, async context => {
      const params = helpers.getQuery(context, {mergeParams: true})

      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      // get info from file
      console.log('-fetching info')
      const info = getRequestInfo("packages/<username>")
      context.response.headers.set('Allow', info.allows)
    
      try {
        // verify
        if(!token) throw new Error('Invalid token')
        await verifyToken(token)

        // check username was provided
        if(!params.username) throw new Error("Username was not provided")
        
        // get packages
        console.log(`-getting package(s) for username: ${params.username}`)

        let filter: Record<string, unknown> = { username: params.username};

        // if courier supplied
        if(params.courier) {
          filter = params.courier.toLowerCase() === 'true' ? 
            { courier : params.username, status : { $ne : 'delivered' } } 
            : 
            filter
        }

        const packages = await getPackages(filter);

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
    // get package by trackingnumber
    .get<{trackingnumber: string}>(`${SUB_ROUTE}/tracking/:trackingnumber`, async context => {
      const trackingNumber = context.params.trackingnumber
      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      // get info from file
      console.log('-fetching info')
      const info = getRequestInfo("packages/tracking/<trackingnumber>")
      context.response.headers.set('Allow', info.allows)
    
      try {
        // verify
        if(!token) throw new Error('Invalid token')
        await verifyToken(token)

        // check trackingNumber was provided
        if(!trackingNumber) throw new Error("Tracking number was not provided")
        
        // get packages
        console.log(`-getting package associated with trackingnumber: ${trackingNumber}`)
        const _package = (await getPackages({_id: new Bson.ObjectId(trackingNumber)}))[0];

        console.log('-responding')
        // set response status
        context.response.status = Status.OK
    
        // create response msg
        const msg = {
          info,
          status: 'success',
          data: _package
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
    // update package status
    .patch(`${SUB_ROUTE}/tracking/:trackingnumber`, async context => {
      const trackingNumber = context.params.trackingnumber
      // check if user has passed authroize header
      console.log('-fetching token')
      const token = context.request.headers.get('Authorization')
      console.log(`auth: ${token}`)
    
      // get info from file
      console.log('-fetching info')
      const info = getRequestInfo("packages/tracking/<trackingnumber>")
      context.response.headers.set('Allow', info.allows)
    
      try {
        const body  = await context.request.body()
        const type = await body.type
    
        // check datatypes of submitted data
        const data = (type != 'json') ? JSON.parse(await body.value) : await body.value;
        
        console.log(data)
        // verify
        if(!token) throw new Error('Invalid token')
        const {username} = await verifyToken(token)

        // check trackingNumber was provided
        if(!trackingNumber) throw new Error("Tracking number was not provided")
        
        // check status was provided
        if(!data.status) throw new Error("Status value is missing")

        // check length
        if(trackingNumber.length !== 24) throw new Error("Tracking number is not the correct length.");

        // patch packages
        console.log(`-patching package status associated with trackingnumber: ${trackingNumber} to ${data.status}`)
        
        const _package = await patchPackage(new Bson.ObjectId(trackingNumber), data.status, username);

        console.log('-responding')
        // set response status
        context.response.status = Status.OK
    
        // create response msg
        const msg = {
          info,
          status: 'success',
          data: _package
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