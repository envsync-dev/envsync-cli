#!/usr/bin/env node

import { program } from "commander";
import { writeFileSync, readFileSync } from "fs";
import path from "path";
import { version } from "../package.json";

type CommandType = "init" | "pull";

const envsyncConfig = {
  configFile: ".envsync",
  defaultDomain: "https://envsync.dev",
  defaultTargetFile: ".env",
};
enum ConfigKeyEnum {
  ENVSYNC_URL = "ENVSYNC_URL",
  ENVSYNC_PROJECT_ID = "ENVSYNC_PROJECT_ID",
  ENVSYNC_ENV_FILE = "ENVSYNC_ENV_FILE",
}

program
  .version(version)
  .description("EnvSync CLI")
  .argument("<command>", "Possible commands: init")
  // .option("-n, --name <type>", "Add your name")
  .action(async (options: CommandType) => {
    switch (options) {
      case "init": {
        const configFileContent = [
          `${ConfigKeyEnum.ENVSYNC_URL}=https://envsync.dev`,
          `${ConfigKeyEnum.ENVSYNC_PROJECT_ID}=`,
          `${ConfigKeyEnum.ENVSYNC_ENV_FILE}=${envsyncConfig.defaultTargetFile}`,
        ];
        writeFileSync(
          path.join(__dirname, envsyncConfig.configFile),
          configFileContent.join("\n")
        );
        break;
      }
      case "pull": {
        const configContents = readFileSync(
          path.join(__dirname, envsyncConfig.configFile),
          {
            encoding: "utf-8",
          }
        );
        const config = new Map();
        configContents.split("\n").forEach((configRow) => {
          const [key, value] = configRow.split("=");
          config.set(key, value);
        });

        const getEnvEndpoint = `${config.get(
          ConfigKeyEnum.ENVSYNC_URL
        )}/api/env/${config.get(ConfigKeyEnum.ENVSYNC_PROJECT_ID)}`;
        const fetchRequest = await fetch(getEnvEndpoint);
        const envVarsResponse: any[] = await fetchRequest.json();

        const envVars = envVarsResponse.map(
          (envVar) => `${envVar.env_var}=${envVar.value}`
        );

        writeFileSync(path.join(__dirname, ".env"), envVars.join("\n"));
        break;
      }

      default:
        break;
    }
  });

program.parse(process.argv);
