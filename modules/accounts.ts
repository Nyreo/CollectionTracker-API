
/* accounts.ts */

import { compare, genSalt, hash } from 'https://deno.land/x/bcrypt@v0.2.4/mod.ts'

import { db } from './db.ts'

const saltRounds = 10
const salt = await genSalt(saltRounds)

export interface loginConfig {
	username: string
	password: string
}

export interface registerConfig {
	username: string
	password: string
	password2?: string
}

export async function login(credentials: loginConfig) {
	let sql = `SELECT count(id) AS count FROM accounts WHERE user="${credentials.username}";`
	let records = await db.query(sql)
	if(!records[0].count) throw new Error(`username "${credentials.username}" not found`)
	sql = `SELECT pass FROM accounts WHERE user = "${credentials.username}";`
	records = await db.query(sql)
	const valid = await compare(credentials.password, records[0].pass)
	if(valid === false) throw new Error(`invalid password for account "${credentials.username}"`)
	return credentials.username
}

export async function register(credentials: registerConfig) {
	credentials.password = await hash(credentials.password, salt)
	console.log('cred')
	console.log(credentials)
	const sql = `INSERT INTO accounts(user, pass) VALUES("${credentials.username}", "${credentials.password}")`
	console.log(sql)
	const records = await db.query(sql)
	return true
}