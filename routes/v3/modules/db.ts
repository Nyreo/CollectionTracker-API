
/* db.ts */

import { MongoClient } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

const client = new MongoClient();

const baseDB : string = Deno.env.get("BASE_DB") || '';
const userDB : string = Deno.env.get("DB_USER") || '';
const passDB : string = Deno.env.get("DB_PASS") || '';

const hostDB : string = Deno.env.get("DB_HOST") || '';

console.log(baseDB)
console.log(userDB)
console.log(passDB)
console.log(hostDB)

await client.connect({
  db: baseDB,
  tls: true,
  servers: [
    { 
      host: hostDB,
      port: 27017,
    },
  ],
  credential: {
    username: userDB,
    password: passDB,
    db: baseDB,
    mechanism: "SCRAM-SHA-1",
  },
});

const db = client.database(baseDB)

export default db;