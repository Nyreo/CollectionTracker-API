import db from './db.ts'
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

import { PackageSchema } from '../interfaces/db_interfaces.ts'

const availableStatus = ['not-dispatched', 'dispatched', 'delivered']

export async function getPackages(filter? : Record<string, unknown>) {

  const packages = db.collection<PackageSchema>("packages");

  const query = filter ? filter : {}
  //@ts-ignore // does not include noCursorTimeout in interface
  const packageList = await packages.find(query, { noCursorTimeout:false })

  return await packageList.toArray()
}

export function postPackage(_package: PackageSchema) {

  const packages = db.collection<PackageSchema>("packages");

  const insertId = packages.insertOne(_package);

  if(insertId) console.log(`Succesfully added the package`)
  else throw new Error("Could not add the package")

  return insertId
}

export async function patchPackage(trackingNumber: Bson.ObjectId, status: string): Promise<boolean> {

  const packages = db.collection<PackageSchema>("packages");

  if(availableStatus.indexOf(status) === -1) throw new Error("Invalid status value")

  const {matchedCount, modifiedCount, upsertedId} = await packages.updateOne(
    { _id : trackingNumber },
    { $set : { status: status }}
  )

  console.log(`matchedCount: ${matchedCount}`)
  console.log(`modifiedCount: ${modifiedCount}`)

  return true
}