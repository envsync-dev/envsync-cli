#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const package_json_1 = require("../package.json");
const envsyncConfig = {
    configFile: ".envsync",
    // defaultDomain: "https://envsync.dev",
    defaultDomain: "http://localhost:3000",
};
var ConfigKeyEnum;
(function (ConfigKeyEnum) {
    ConfigKeyEnum["ENVSYNC_URL"] = "ENVSYNC_URL";
    ConfigKeyEnum["ENVSYNC_PROJECT_ID"] = "ENVSYNC_PROJECT_ID";
})(ConfigKeyEnum || (ConfigKeyEnum = {}));
commander_1.program
    .version(package_json_1.version)
    .description("EnvSync CLI")
    .argument("<command>", "Possible commands: init")
    // .option("-n, --name <type>", "Add your name")
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    switch (options) {
        case "init": {
            const configFileContent = [
                `${ConfigKeyEnum.ENVSYNC_URL}=https://envsync.dev`,
                `${ConfigKeyEnum.ENVSYNC_PROJECT_ID}=`,
            ];
            (0, fs_1.writeFileSync)(path_1.default.join(__dirname, envsyncConfig.configFile), configFileContent.join("\n"));
            break;
        }
        case "pull": {
            const configContents = (0, fs_1.readFileSync)(path_1.default.join(__dirname, envsyncConfig.configFile), {
                encoding: "utf-8",
            });
            const config = new Map();
            configContents.split("\n").forEach((configRow) => {
                const [key, value] = configRow.split("=");
                config.set(key, value);
            });
            // /api/env/
            const getEnvEndpoint = `${config.get(ConfigKeyEnum.ENVSYNC_URL)}/api/env/${config.get(ConfigKeyEnum.ENVSYNC_PROJECT_ID)}`;
            const fetchRequest = yield fetch(getEnvEndpoint);
            const envVarsResponse = yield fetchRequest.json();
            const envVars = envVarsResponse.map((envVar) => `${envVar.env_var}=${envVar.value}`);
            (0, fs_1.writeFileSync)(path_1.default.join(__dirname, ".env"), envVars.join("\n"));
            break;
        }
        default:
            break;
    }
}));
commander_1.program.parse(process.argv);
