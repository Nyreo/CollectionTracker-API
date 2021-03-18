export interface loginConfig {
	username: string
	password: string
}

export interface registerConfig {
	username: string
	password: string
	password2?: string
}

export interface requestInfo {
  name: string
  desc : string
  schema? : Record<string, unknown>
  links? : requestLinks[]
  allows : string
}

export interface requestLinks {
  name: string
  desc: string
  href: string
}