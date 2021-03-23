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

export async function patchPickupPackage(trackingNumber: Bson.ObjectId, username: string): Promise<PackageSchema> {

  const packages = db.collection<PackageSchema>("packages");
  const status = 'in-transit'

  // check if that package has already been selected
  await checkAlreadySelected(trackingNumber)
  
  // set fields to be changed
  const setFields: Record<string, unknown> = {
    status, 
    courier: username
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

export async function patchDeliverPackage(trackingNumber: Bson.ObjectId, username: string, deliveryDetails: DeliveryDetailsSchema): Promise<PackageSchema> {

  const packages = db.collection<PackageSchema>("packages");
  const status = 'delivered'

  // check if that package has already been selected
  await checkCourierAssignmenet(trackingNumber, username)
  
  // set fields to be changed
  const setFields: Record<string, unknown> = {
    status,
    deliveryDetails
  }

  const { matchedCount, modifiedCount } = await packages.updateOne(
    { _id : trackingNumber },
    { $set : setFields }
  )

  if(matchedCount <= 0) throw new Error("A package with that tracking number does not exist.");
  if(modifiedCount <= 0) throw new Error("No changes were made.");

  // return record
  //@ts-ignore // does not include noCursorTimeout in interface
  const _package: PackageSchema = await packages.findOne({ _id: trackingNumber }, { noCursorTimeout:false })

  return _package
}

// checks if package has already been selected by courier
async function checkAlreadySelected(trackingNumber: Bson.ObjectId) {
  const packages = db.collection<PackageSchema>("packages");

  const count = await packages.count({
    _id: trackingNumber,
    status: { $ne : 'not-dispatched' }
  })

  console.log(count)

  if(count) throw new Error("A courier has already selected that package")
}

async function checkCourierAssignmenet(trackingNumber: Bson.ObjectId, username: string) {
  const packages = db.collection<PackageSchema>("packages");

  // check if courier is assigned to the specified package
  const count = await packages.count({
    _id: trackingNumber,
    courier: username
  })

  console.log(count)

  if(!count) throw new Error("That package has been selected by another courier.")
}