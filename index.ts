/* index.js */
import { Application } from "https://deno.land/x/oak/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

// dotenv
import "https://deno.land/x/dotenv/load.ts";

// routers
import baseRouter from "./routes/base/hub.ts";

const defaultPort = 8080;
const { args } = Deno;
const argPort = parse(args).port;
const port = argPort ? Number(argPort) : defaultPort;

const app = new Application();

// error handler
app.use(async (context, next) => {
  try {
    console.log(context.request.url.href);
    context.response.headers.set("Content-Type", "application/json");

    await next();
  } catch (err) {
    console.log(err);
  }
});

app.use((ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  return next();
});

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// routes -- includes all versioning routes
app.use(baseRouter.routes());
app.use(baseRouter.allowedMethods());

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
app.use((context) => {
  try {
    console.log("404 PAGE NOT FOUND");
    context.response.body = { status: "error", msg: "page not found" };
  } catch (err) {
    console.error(err);
  }
});

app.addEventListener("listen", ({ port }) => {
  console.log(`listening on port: ${port}`);
});

await app.listen({ port });
