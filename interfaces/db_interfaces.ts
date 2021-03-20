
export interface AccountSchema {
  _id: { $oid: string}
  username: string
  password: string
  userType: string
}

export interface PackageSchema {
  _id: { $oid: string }
  trackingNumber: string
  status: string
  addTime: number
  username: string
  address: string
  recpName: string
  weight: number
  destPostcode: string
  sendPostcode: string
}
