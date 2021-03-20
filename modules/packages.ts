import db from './db.ts'

import { PackageSchema } from '../interfaces/db_interfaces.ts'

export async function getPackages(filter? : Record<string, unknown>) {

  const packages = db.collection<PackageSchema>("packages");

  const query = filter ? filter : {}
  //@ts-ignore // does not include noCursorTimeout in interface
  const packageList = await packages.find(query, { noCursorTimeout:false })

  return await packageList.toArray()
}

export function postPackage(_package: PackageSchema) {

  console.log(_package)

  const packages = db.collection<PackageSchema>("packages");

  const insertId = packages.insertOne(_package);

  if(insertId) console.log(`Succesfully added the package`)
  else throw new Error("Could not add the package")

  return true
}