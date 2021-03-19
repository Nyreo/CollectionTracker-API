
/* index.js */

import { Application, Router, Status } from 'https://deno.land/x/oak/mod.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'
import { oakCors } from "https://deno.land/x/cors/mod.ts";

// dotenv
import "https://deno.land/x/dotenv/load.ts";

import router from './routes.ts'

const defaultPort = 8080
const { args } = Deno
const argPort = parse(args).port
const port = argPort ? Number(argPort) : defaultPort

const app = new Application()

// error handler
app.use(async (context, next) => {
	try {
		console.log(context.request.url.href)
		context.response.headers.set('Content-Type', 'application/json')
    
		await next()
	} catch (err) {
		console.log(err)
	}
})

app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*')
  return next()
})

// routes
app.use(router.routes())
app.use(router.allowedMethods())



// static content
// app.use(async (context, next) => {
// 	const root = `${Deno.cwd()}/public`
// 	try {
// 		await context.send({ root })
// 	} catch {
// 		next()
// 	}
// })

// page not found
app.use( context => {
	try {
		console.log('404 PAGE NOT FOUND')
		context.response.body = { status: 'error', msg: 'page not found' }
	} catch(err) {
		console.error(err)
	}
})

app.addEventListener('listen', ({ port }) => {
	console.log(`listening on port: ${port}`)
})

await app.listen({ port })
