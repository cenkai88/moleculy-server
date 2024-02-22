import inquirer from "inquirer";
import figlet from "figlet";

import vpnPrompt from "./cli/VPN.js";
import minioPrompt from "./cli/minio.js";

let envId;

console.log(figlet.textSync("MOLECULY - server"));
console.log("内网程序安装引导，将安装启动以下服务：");

let components = [
  {
    service: "VPN",
    status: "OK",
  },
  {
    service: "minio",
    status: "OK",
  },
  {
    service: "nginx",
    status: "OK",
  },
  {
    service: "thumbnail",
    status: "OK",
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
await minioPrompt(envId);
