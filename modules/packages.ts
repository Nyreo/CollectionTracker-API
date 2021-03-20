import db from './db.ts'

import { PackageSchema } from '../interfaces/db_interfaces.ts'

export async function getPackages(username?: string) {

  const packages = db.collection<PackageSchema>("packages");

  // const query = username ? {username} : {}
  //@ts-ignore // does not include noCursorTimeout in interface
  const packageList = await packages.find({}, { noCursorTimeout:false })

  return await packageList.toArray()
}