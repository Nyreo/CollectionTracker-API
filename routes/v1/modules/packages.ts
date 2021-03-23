import db from './db.ts'
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

import { PackageSchema, DeliveryDetailsSchema } from '../interfaces/db_interfaces.ts'

const availableStatus = ['not-dispatched', 'in-transit', 'delivered']

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

export async function patchPackage(trackingNumber: Bson.ObjectId, status: string, username: string): Promise<PackageSchema> {

  const packages = db.collection<PackageSchema>("packages");
  status = status.toLowerCase()

  if(availableStatus.indexOf(status) === -1) throw new Error(`Invalid status value, accepted values: ${availableStatus}`)

  // if changing to dispatched, set courier value asw well 
  let setFields: Record<string, unknown> = {status}
  if(status === 'in-transit') {
    setFields = {...setFields, courier: username}
  }

  const { matchedCount, modifiedCount } = await packages.updateOne(
    { _id : trackingNumber },
    { $set : setFields}
  )

  if(matchedCount <= 0) throw new Error("A package with that tracking number does not exist.");
  if(modifiedCount <= 0) throw new Error("No changes were made.");

  // return record
  //@ts-ignore // does not include noCursorTimeout in interface
  const _package: PackageSchema = await packages.findOne({ _id: trackingNumber }, { noCursorTimeout:false })

  return _package
}