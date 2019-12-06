"use strict";

var _ = require("lodash");
var clc = require("cli-color");
var path = require("path");

var { FirebaseError } = require("../../error");
var parseBoltRules = require("../../parseBoltRules");
var rtdb = require("../../rtdb");
var utils = require("../../utils");
const getProjectNumber = require("./getProjectNumber");
const firedata = require("./gcp/firedata");
const getProjectId = require("./getProjectId");

module.exports = async function(context, options) {
  var rulesConfig = options.config.get("database");
  var next = Promise.resolve();
  if (_.isString(_.get(rulesConfig, "rules"))) {
    rulesConfig = [_.assign(rulesConfig, { instance: options.instance })];
  }
  console.log(rulesConfig)
  const projectId = getProjectId(options);
  const projectNumber = await getProjectNumber(options)

  var ruleFiles = {};
  var downloads = [];
    const instances = await firedata.listDatabaseInstances(projectNumber);
    for (const instance of instances) {

      // _getDBRules(instance)
      console.log(instance)
    }

  rulesConfig.forEach(function(ruleConfig) {
    if (!ruleConfig.rules) {
      return;
    }

    ruleFiles[ruleConfig.rules] = null;

    if (ruleConfig.target) {
      options.rc.requireTarget(context.projectId, "database", ruleConfig.target);
      var instances = options.rc.target(context.projectId, "database", ruleConfig.target);
      downloads = downloads.concat(
        instances.map(function(inst) {
          return { instance: inst, rules: ruleConfig.rules };
        })
      );
    } else if (!ruleConfig.instance) {
      throw new FirebaseError('Must supply either "target" or "instance" in database config');
    } else {
      downloads.push(ruleConfig);
    }
  });
  //
  // _.forEach(ruleFiles, function(v, file) {
  //   switch (path.extname(file)) {
  //     case ".json":
  //       ruleFiles[file] = options.config.readProjectFile(file);
  //       break;
  //     case ".bolt":
  //       ruleFiles[file] = parseBoltRules(file);
  //       break;
  //     default:
  //       throw new FirebaseError("Unexpected rules format " + path.extname(file));
  //   }
  // });
  //
  // context.database = {
  //   downloads: downloads,
  //   ruleFiles: ruleFiles,
  // };
  // utils.logBullet(clc.bold.cyan("database: ") + "checking rules syntax...");
  // return Promise.all(
  //   downloads.map(function(deploy) {
  //     return rtdb
  //       .updateRules(deploy.instance, ruleFiles[deploy.rules], { dryRun: true })
  //       .then(function() {
  //         utils.logSuccess(
  //           clc.bold.green("database: ") +
  //             "rules syntax for database " +
  //             clc.bold(deploy.instance) +
  //             " is valid"
  //         );
  //       });
  //   })
  // );
};


// const getProjectNumber = require("firebase-tools/lib/getProjectNumber");
// const firedata = require("firebase-tools/lib/gcp/firedata");
// const getProjectId = require("firebase-tools/lib/getProjectId");
// // const authInitialized: (iThinkThisIsAnOutParam: any) => Promise<void> = require('firebase-tools/lib/requireAuth');
// const api = require('firebase-tools/lib/api');
// const utils = require('firebase-tools/lib/utils');
// const clc = require("cli-color");
//
// const _getDBRules = (instance : string , filename : string, config : any) => {
//   return api
//     .request("GET", "/.settings/rules.json", {
//       auth: true,
//       origin: utils.addSubdomain(api.realtimeOrigin, instance),
//     })
//     .then((response : any) => {
//       return response.body;
//     })
//     .then((rules : any) => {
//       return config.writeProjectFile(filename, rules);
//     })
//     .then(() => {
//       utils.logSuccess(
//         "Database Rules for " +
//           clc.bold(instance) +
//           " have been downloaded to " +
//           clc.bold(filename) +
//           "."
//       );
//     });
// };
//
// //
// export {};
//
// module.exports = async (client: any, options : any, setup : any) => {
//   console.log("Download RTDB state");
//   // console.log("CLI")
//   // console.log(client)
//   // console.log(setup)
//   const projectId = getProjectId(options);
//   console.log(projectId)
//   // const projectNumber = await
//   let projectNumber;
//   api
//   .request("GET", "/v1beta1/projects/" + projectId, {
//     auth: true,
//     origin: api.firebaseApiOrigin,
//   })
//   .then((response : any) => {
//     // console.log("got project Number", response)
//     options.projectNumber = response.body.projectNumber;
//     return options.projectNumber;
//   }).catch((e:Error)=>{console.log("error",e)});
//
//   getProjectNumber(options).then((data:any)=>{console.log("data"); projectNumber = data}).catch((e:Error)=>{console.log("error",e)});
//   console.log(projectNumber)
//   const targets :any = options.rc.targets(options.project, "database");
//   // console.log("targets",targets)
//   // client.target.apply
//   // askWriteProjectFile
//   const instances = await firedata.listDatabaseInstances(projectNumber);
//   for (const instance of instances) {
//
//     // _getDBRules(instance)
//     console.log(instance)
//   }
//
// };
