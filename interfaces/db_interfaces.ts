
export interface AccountSchema {
  _id: { $oid: string}
  username: string
  password: string
  userType: string
}

export interface DeliveryDetailsSchema {
  time: number
  lat: number
  lng: number
  handedTo: string
}

export interface PackageSchema {
  _id: { $oid: string }
  status: string
  addTime: number
  username: string
  address: string
  recpName: string
  weight: number
  destPostcode: string
  sendPostcode: string
  courier? : string
  deliveryDetails? : DeliveryDetailsSchema
}