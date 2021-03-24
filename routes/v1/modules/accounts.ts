
/* accounts.ts */

import { compare, genSalt, hash } from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts'

import db from './db.ts'

import { AccountSchema } from '../interfaces/db_interfaces.ts'
import { loginConfig, registerConfig } from '../interfaces/request_interfaces.ts'

const saltRounds = 10
const salt = await genSalt(saltRounds)

export async function login(credentials: loginConfig) {
	
  const accounts = db.collection<AccountSchema>("accounts");
  
  //@ts-ignore //interface for built-in function does not include the option provided
  // check user exists
  const user = await accounts.findOne({username:credentials.username}, { noCursorTimeout:false })
  
  if(!user) throw new Error("A user with that name does not exist.")
  else {
    console.log(`Comparing passwords: ${credentials.password},${user.password}`)
    const pass = user.password
    const valid = await compare(credentials.password, pass);


    if(!valid) throw new Error(`Invalid password for user: ${credentials.username}.`);
  }
  return {username: user.username, userType: user.userType};
}

export async function register(credentials: registerConfig) {
	credentials.password = await hash(credentials.password, salt)
	console.log(credentials)

  const accounts = db.collection<AccountSchema>("accounts")

  // check is user with that username already exists
  //@ts-ignore //interface for built-in function does not include the option provided
  const user = await accounts.findOne({username:credentials.username}, { noCursorTimeout:false })
  if(user) throw new Error("An account with that username already exists");

  const insertId = await accounts.insertOne(credentials);

  if(insertId) console.log(`Succesfully registered the user: ${credentials.username}`)
  else throw new Error("Could not register...")
	return true
}