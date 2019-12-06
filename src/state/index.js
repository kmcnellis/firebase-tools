let logger = require("../logger");
let api = require("../api");
let clc = require("cli-color");
let _ = require("lodash");
let getProjectId = require("../getProjectId");
let utils = require("../utils");
let { FirebaseError } = require("../error");
let track = require("../track");
// let lifecycleHooks = require("./lifecycleHooks");

let TARGETS = {
  // hosting: require("./hosting"),
  database: require("./database"),
  // firestore: require("./firestore"),
  // functions: require("./functions"),
  // storage: require("./storage"),
};

// module.exports = new Command("state:download")
//   .description("download current project state")
//   // .before(requireInstance)
//   .action((options) => {
//     // console.log("Command download state", options)
//     return prompt(options, [
//       {
//         type: "confirm",
//         name: "confirm",
//         default: false,
//         message:
//           "You are about to your local rules" +
//           ". Are you sure?",
//       },
//     ]).then(() => {
//       let config;
//       config = CONFIG.load(options, true);
//
//       const existingConfig = !!config;
//       if (!existingConfig) {
//         config = new CONFIG({}, { projectDir: "." });
//       } else {
//         console.log("You are using an existing Firebase project directory");
//       }
//
//       const setup = {
//         config: config._src,
//         rcfile: config.readProjectFile(".firebaserc", {
//           json: true,
//           fallback: {},
//         }),
//       };
//       console.log("Pulling DB rules")
//       database(options, setup);
//
//       utils.logBullet("Writing configuration info to " + clc.bold("firebase.json") + "...");
//       config.writeProjectFile("firebase.json", setup.config);
//       utils.logBullet("Writing project information to " + clc.bold(".firebaserc") + "...");
//       config.writeProjectFile(".firebaserc", setup.rcfile);
//
//     });
//   });

  let _noop = function() {
    return Promise.resolve();
  };

  let _chain = function(fns, context, options, payload) {
    let latest = (fns.shift() || _noop)(context, options, payload);
    if (fns.length) {
      return latest.then(function() {
        return _chain(fns, context, options, payload);
      });
    }

    return latest;
  };

  /**
   */
  let state = function(targetNames, options) {
    let projectId = getProjectId(options);
    let payload = {};
    // a shared context object for deploy targets to decorate as needed
    let context = { projectId: projectId };
    let downloads = [];

    for (let i = 0; i < targetNames.length; i++) {
      let targetName = targetNames[i];
      let target = TARGETS[targetName];

      if (!target) {
        return Promise.reject(
          new FirebaseError(clc.bold(targetName) + " is not a valid state target", { exit: 1 })
        );
      }

      if (target.download) {
        downloads.push(target.download);
      }
    }

    logger.info();
    logger.info(clc.bold(clc.white("===") + " Downloading state for '" + projectId + "'..."));
    logger.info();

    utils.logBullet("downloading state " + clc.bold(targetNames.join(", ")));

    return _chain(downloads, context, options, payload)
      .then(function() {
        logger.info();
        utils.logSuccess(clc.underline.bold("Download complete!"));
      });
  };

  state.TARGETS = TARGETS;

  module.exports = state;
