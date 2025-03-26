import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";

import yxysCAPrompt from "./cli/yxys-ca.js";

import { getIntranetIp } from "./cli/utils.js";

let envId;

console.log(figlet.textSync("MOLECULY - server"));
console.log("内网程序安装引导，将安装启动以下服务：");

let components = [
  {
    service: "VPN",
    status: "待部署",
  },
  {
    service: "Certificate Refresher",
    status: "待部署",
  },
  {
    service: "Nginx",
    status: "待部署",
  },
  {
    service: "MinIO",
    status: "待部署",
  },
  {
    service: "blockchain node",
    status: "待部署",
  },
  {
    service: "thumbnail + blockchain API",
    status: "待部署",
  },
  {
    service: "prometheus exporter",
    status: "待部署",
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

const { ip } = await inquirer.prompt([
  {
    type: "input",
    name: "ip",
    message: "请确认内网ip",
    default: getIntranetIp(),
  },
]);

// ca
await yxysCAPrompt(envId, ip);
components[1].status = "OK";
console.table(components);



console.log(chalk.greenBright.bold('✔ moleculy server初始化全部完成，请检查443、80、30333端口是否已经放开'));
