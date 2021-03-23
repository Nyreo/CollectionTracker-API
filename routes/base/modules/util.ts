
import { requestInfo } from '../interfaces/request_interfaces.ts'

/* util.ts */
const baseRequests = JSON.parse(Deno.readTextFileSync('./routes/base/requests.json'));
const v1Requests = JSON.parse(Deno.readTextFileSync('./routes/v1/requests.json'));
const v2Requests = JSON.parse(Deno.readTextFileSync('./routes/v2/requests.json'));
const v3Requests = JSON.parse(Deno.readTextFileSync('./routes/v3/requests.json'));

const requests: Record<string, Record<string, requestInfo>> = {
  "v0": baseRequests,
  "v1": v1Requests,
  "v2": v2Requests,
  "v3": v3Requests,
}

export function getRequestInfo(VERSION: string, request: string, host?: string): requestInfo {
  // get base info
  const info: requestInfo = requests[VERSION][request];

  // customise links to include host - if they exist
  if(info.links) {
    for(const link of info.links) {
      link.href = `${host}/${VERSION}/${link.name}`;
    }
  }
  return info;
}
