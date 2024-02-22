import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";

import vpnPrompt from "./cli/VPN.js";
import minioPrompt from "./cli/minio.js";

let envId;

console.log(figlet.textSync("MOLECULY - server"));
console.log("内网程序安装引导，将安装启动以下服务：");

let components = [
  {
    service: "VPN",
    status: chalk.gray("待部署"),
  },
  {
    service: "minio",
    status: chalk.gray("待部署"),
  },
  {
    service: "nginx",
    status: chalk.gray("待部署"),
  },
  {
    service: "thumbnail",
    status: chalk.gray("待部署"),
  },
];

console.table(components);

({ envId } = await inquirer.prompt([
  {
    type: "input",
    name: "envId",
    message: "当前环境ID",
  },
]));


await vpnPrompt();
components[0].status = chalk.green("OK");
console.table(components);

await minioPrompt(envId);
