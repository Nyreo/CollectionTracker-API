
export interface AccountSchema {
  _id: { $oid: string};
  username: string;
  password: string;
}
