export interface requestInfo {
  name: string
  desc : string
  schema? : Record<string, unknown>
  links? : requestLinks[]
  queries? : string
  allows : string
}

export interface requestLinks {
  name: string
  desc: string
  href: string
}