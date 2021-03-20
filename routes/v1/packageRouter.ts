import { Router, Status, helpers } from 'https://deno.land/x/oak/mod.ts'
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

import { extractCredentials, getRequestInfo, verifyToken } from '../../modules/util.ts'

import { getPackages, postPackage, patchPackage } from '../../modules/packages.ts';

const withPackageRouter = (router: Router) => {

  const SUB_ROUTE = '/packages'

  router
    // get all packages
    .get(SUB_ROUTE, async context => {
      console.log(`GET ${SUB_ROUTE}`)

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
      console.log(`POST ${SUB_ROUTE}`)
  
      // get info from file
      const info = getRequestInfo("packages")
      context.response.headers.set('Allow', info.allows)
    
      try {
        const body  = await context.request.body()
        const type = await body.type
    
        // check datatypes of submitted data
        const data = (type != 'json') ? JSON.parse(await body.value) : await body.value;
    
        // attempt to register the user
        console.log('-received package')
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

      

      const username = context.params.username
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
        if(!username) throw new Error("Username was not provided")
        
        // get packages
        console.log(`-getting package(s) for username: ${username}`)
        const packages = await getPackages({username});

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
        await verifyToken(token)

        // check trackingNumber was provided
        if(!trackingNumber) throw new Error("Tracking number was not provided")
        
        // check status was provided
        if(!data.status) throw new Error("Status value is missing")

        // patch packages
        console.log(`-patching package status associated with trackingnumber: ${trackingNumber} to ${data.status}`)
        
        const success: boolean = await patchPackage(new Bson.ObjectId(trackingNumber), data.status);
        if(!success) throw new Error("Issue updating that package, please check the error message");

        console.log('-responding')
        // set response status
        context.response.status = Status.OK
    
        // create response msg
        const msg = {
          info,
          status: 'success',
          data: { status : data.status }
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