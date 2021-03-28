import { helpers, Router, Status } from "https://deno.land/x/oak/mod.ts";
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

import {
  getRequestInfo,
  saveFile,
  validateTrackingNumber,
  verifyToken,
} from "./modules/util.ts";

import {
  getPackages,
  patchDeliverPackage,
  patchPickupPackage,
  postPackage,
} from "./modules/packages.ts";

const withPackageRouter = (VERSION: string, router: Router) => {
  const SUB_ROUTE = `/${VERSION}/packages`;

  router
    // get all packages - with optional filter
    .get(SUB_ROUTE, async (context) => {
      // get host
      const HOST = context.request.url.host;
      // get optional params
      console.log("-getting parms");
      const params = helpers.getQuery(context, { mergeParams: true });
      // check if user has passed authroize header
      console.log("-fetching token");
      const token = context.request.headers.get("Authorization");
      console.log(`auth: ${token}`);

      // get info from file
      console.log("-fetching info");
      const info = getRequestInfo(VERSION, "packages", HOST);
      context.response.headers.set("Allow", info.allows);

      try {
        // verify
        if (!token) throw new Error("Invalid token");
        await verifyToken(token);

        const filter: Record<string, unknown> = {};

        if (params.courier && params.courier.toLowerCase() === "true") {
          filter.courier = params.username;
          filter.status = {
            $ne: "delivered",
          };
        } else filter["username"] = params.username;

        console.log(filter);

        // get packages
        console.log("-getting packages");
        const packages = await getPackages(filter);

        console.log("-responding");
        // set response status
        context.response.status = Status.OK;

        // create response msg
        const msg = {
          info,
          status: "success",
          data: packages,
        };
        context.response.body = JSON.stringify(msg, null, 2);
      } catch (err) {
        // if error occured, set status to unauthorized, send message
        context.response.status = Status.Unauthorized;
        const msg = {
          info,
          status: "Unauthorized",
          msg: "This route requires Basic Access Authentication",
          err: err.message,
        };
        context.response.body = JSON.stringify(msg, null, 2);
      }
    })
    // add new package
    .post(SUB_ROUTE, async (context) => {
      // get host
      const HOST = context.request.url.host;
      // check if user has passed authroize header
      console.log("-fetching token");
      const token = context.request.headers.get("Authorization");
      console.log(`auth: ${token}`);

      // get info from file
      const info = getRequestInfo(VERSION, "packages", HOST);
      context.response.headers.set("Allow", info.allows);

      try {
        // verify
        if (!token) throw new Error("Invalid token");
        const { username } = await verifyToken(token);

        const body = await context.request.body();
        const type = await body.type;

        // check datatypes of submitted data
        const data = (type != "json")
          ? JSON.parse(await body.value)
          : await body.value;

        // attempt to register the user
        console.log("-received package");

        // add inferred data
        data.username = username;
        data.date = (new Date()).getTime();
        data.status = "not-dispatched";

        const _id = await postPackage(data);

        // set reponse status
        context.response.status = Status.Created;
        const msg = {
          info,
          status: "Created",
          msg: "package added",
          data: { trackingNumber: _id },
        };
        context.response.body = JSON.stringify(msg, null, 2);
      } catch (err) {
        context.response.status = Status.NoContent;
        const msg = {
          info,
          status: "NoContent",
          msg: "Could not add package",
          err: err.message,
        };
        context.response.body = JSON.stringify(msg, null, 2);
      }
    })
    // upload signature
    .post(`${SUB_ROUTE}/signatures`, async (context) => {
      // get host
      const HOST = context.request.url.host;

      // check if user has passed authroize header
      console.log("-fetching token");
      const token = context.request.headers.get("Authorization");
      console.log(`auth: ${token}`);

      // get info from file
      console.log("-fetching info");
      const info = getRequestInfo(VERSION, "packages/signatures", HOST);
      context.response.headers.set("Allow", info.allows);

      try {
        const body = await context.request.body();
        const type = await body.type;

        // check datatypes of submitted data
        const data = (type != "json")
          ? JSON.parse(await body.value)
          : await body.value;

        console.log(data);
        // verify
        if (!token) throw new Error("Invalid token");
        await verifyToken(token);

        validateTrackingNumber(data.trackingNumber);
        // check image was provided
        if (!data.signature64) throw new Error("Signature was not provided.");

        console.log(`-uploading signature for : ${data.trackingNumber}`);
        saveFile(data.signature64, data.trackingNumber);

        console.log("-responding");
        // set response status
        context.response.status = Status.Created;

        // create response msg
        const msg = {
          info,
          status: "success",
        };
        context.response.body = JSON.stringify(msg, null, 2);
      } catch (err) {
        // if error occured, set status to unauthorized, send message
        context.response.status = Status.Unauthorized;
        const msg = {
          info,
          status: "Unauthorized",
          msg: "This route requires Basic Access Authentication",
          err: err.message,
        };
        context.response.body = JSON.stringify(msg, null, 2);
      }
    })
    // packages by username
    .get<{ trackingnumber: string }>(
      `${SUB_ROUTE}/:trackingnumber`,
      async (context) => {
        // get host
        const HOST = context.request.url.host;
        // get params
        const params = helpers.getQuery(context, { mergeParams: true });

        // check if user has passed authroize header
        console.log("-fetching token");
        const token = context.request.headers.get("Authorization");
        console.log(`auth: ${token}`);

        // get info from file
        console.log("-fetching info");
        const info = getRequestInfo(VERSION, "packages/:trackingnumber", HOST);
        context.response.headers.set("Allow", info.allows);

        try {
          // verify
          if (!token) throw new Error("Invalid token");
          await verifyToken(token);

          // check username was provided
          validateTrackingNumber(params.trackingnumber);

          // get packages
          console.log(
            `-getting package associated with tracking number: ${params.trackingnumber}`,
          );

          const filter = { _id: new Bson.ObjectId(params.trackingnumber) };

          const packages = await getPackages(filter);

          console.log("-responding");
          // set response status
          context.response.status = Status.OK;

          // create response msg
          const msg = {
            info,
            status: "success",
            data: packages,
          };
          context.response.body = JSON.stringify(msg, null, 2);
        } catch (err) {
          // if error occured, set status to unauthorized, send message
          context.response.status = Status.Unauthorized;
          const msg = {
            info,
            status: "Unauthorized",
            msg: "This route requires Basic Access Authentication",
            err: err.message,
          };
          context.response.body = JSON.stringify(msg, null, 2);
        }
      },
    )
    // update package status
    .patch<{ trackingnumber: string }>(
      `${SUB_ROUTE}/:trackingnumber`,
      async (context) => {
        // get host
        const HOST = context.request.url.host;
        // get optional params
        console.log("-getting parms");
        const params = helpers.getQuery(context, { mergeParams: true });
        console.log(params);
        // check if user has passed authroize header
        console.log("-fetching token");
        const token = context.request.headers.get("Authorization");
        console.log(`auth: ${token}`);

        // get info from file
        console.log("-fetching info");
        const info = getRequestInfo(VERSION, "packages/:trackingnumber", HOST);
        context.response.headers.set("Allow", info.allows);

        try {
          const body = await context.request.body();
          const type = await body.type;

          // check datatypes of submitted data
          const data = (type != "json")
            ? JSON.parse(await body.value)
            : await body.value;

          console.log(data);
          // verify
          if (!token) throw new Error("Invalid token");
          const { username, userType } = await verifyToken(token);

          if (userType != "courier") {
            throw new Error(
              "You need to be a courier to change the status of a package",
            );
          }

          validateTrackingNumber(params.trackingnumber);

          // check status was provided
          if (!data.status) {
            throw new Error("You did not provide any status value");
          }

          // patch packages
          console.log(
            `-patching package status associated with trackingnumber: ${params.trackingnumber} to ${data.status}`,
          );

          let _package;

          if (data.status === "in-transit") {
            _package = await patchPickupPackage(
              new Bson.ObjectId(params.trackingnumber),
              username,
            );
          } else if (data.status === "delivered") {
            // validate delivery details
            if (!data.deliveryDetails) {
              throw new Error("You have not provided any delivery details");
            }

            _package = await patchDeliverPackage(
              new Bson.ObjectId(params.trackingnumber),
              username,
              data.deliveryDetails,
            );
          }

          console.log("-responding");
          // set response status
          context.response.status = Status.OK;

          // create response msg
          const msg = {
            info,
            status: "success",
            data: _package,
          };
          context.response.body = JSON.stringify(msg, null, 2);
        } catch (err) {
          // if error occured, set status to unauthorized, send message
          context.response.status = Status.Unauthorized;
          const msg = {
            info,
            status: "Unauthorized",
            msg: "This route requires Basic Access Authentication",
            err: err.message,
          };
          context.response.body = JSON.stringify(msg, null, 2);
        }
      },
    );
};

export default withPackageRouter;
