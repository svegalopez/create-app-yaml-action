const core = require("@actions/core");
const yaml = require("js-yaml");
const path = require("path");
const writeFileSync = require("fs").writeFileSync;

async function run() {
  try {
    // Supported app.yaml params
    // More will be added as needed
    let params = {
      inbound_services: [],
      runtime: null,
      env_variables: {},
      automatic_scaling: {},
    };

    for (const key of Object.keys(process.env)) {
      const value = process.env[key];
      if (key.startsWith("ENVKEY_")) {
        params.env_variables[key.slice(7)] = value;
      } else if (key.startsWith("AUTOSCALING_")) {
        params.automatic_scaling[key.slice(12)] = value;
      } else if (key.startsWith("VALUE_")) {
        params[key.slice(6)] = value;
      } else if (key.startsWith("INBOUND_SERVICES")) {
        params.inbound_services.push(...value.split(","));
      }
    }

    const directory = core.getInput("directory") || "";
    const fileName = core.getInput("filename") || "app.yaml";
    let filePath = process.env["GITHUB_WORKSPACE"] || ".";

    if (filePath === "" || filePath === "None") {
      filePath = ".";
    }

    if (directory === "") {
      filePath = path.join(filePath, fileName);
    } else if (directory.startsWith("/")) {
      throw new Error(
        "Absolute paths are not allowed. Please use a relative path."
      );
    } else if (directory.startsWith("./")) {
      filePath = path.join(filePath, directory.slice(2), fileName);
    } else {
      filePath = path.join(filePath, directory, fileName);
    }

    const yamlDump = yaml.dump(params);

    core.info(`Writing to: ${filePath}`);
    core.info(`${fileName}:`);
    core.info(yamlDump);

    writeFileSync(filePath, yamlDump);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
