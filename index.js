import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";
import hostile from "hostile";

import vpnPrompt from "./cli/VPN.js";
import nginxPrompt from "./cli/nginx.js";
import minioPrompt from "./cli/minio.js";
import blockchainPrompt from "./cli/blockchain.js";

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
    service: "Prometheus node-exporter",
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

hostile.set(ip, `minio-${envId}.moleculy.com`);
hostile.set(ip, `web-${envId}.moleculy.com`);
hostile.set(ip, `api-${envId}.moleculy.com`);
hostile.set(ip, `application-${envId}.moleculy.com`);
hostile.set(ip, `app-api-${envId}.moleculy.com`);
hostile.set(ip, `ws-${envId}.moleculy.com`);
hostile.set(ip, `cms-${envId}.moleculy.com`);
hostile.set(ip, `thumbnail-${envId}.moleculy.com`);

console.log("设置DNS完成");

await vpnPrompt();
components[0].status = "OK";
console.table(components);

// ca

await nginxPrompt(envId, ip);
components[2].status = "OK";
console.table(components);

await minioPrompt(envId);
components[3].status = "OK";
console.table(components);

await blockchainPrompt();
components[4].status = "OK";
console.table(components);

console.log(chalk.greenBright.bold('✔ moleculy server初始化全部完成'));
