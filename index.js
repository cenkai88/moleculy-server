import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";
import hostile from "hostile";

import vpnPrompt from "./cli/VPN.js";
import nginxPrompt from "./cli/nginx.js";
import minioPrompt from "./cli/minio.js";

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

hostile.set("127.0.0.1", `minio-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `web-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `api-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `application-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `app-api-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `ws-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `cms-${envId}.moleculy.com`);
hostile.set("127.0.0.1", `thumbnail-${envId}.moleculy.com`);

console.log("设置DNS完成");

await vpnPrompt();
components[0].status = "OK";
console.table(components);

// ca

await nginxPrompt(envId);
components[2].status = "OK";
console.table(components);

await minioPrompt(envId);
components[2].status = "OK";
console.table(components);

