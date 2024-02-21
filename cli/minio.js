import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import randomize from "randomatic";

const exec = util.promisify(execRaw);

// $MINIO_ROOT_PASSWORD: 初始密码
// $MINIO_WEBHOOK_DOMAIN: webhook的域名，根据envId来的

export default (envId) =>
  new Promise(async (resolve, reject) => {
    console.log("1 ->>>>>>>>>>>>> minio初始化：");

    const password = randomize("Aa0", 12);

    console.log(chalk.red.bold("用户名: ") + "ingsh");
    console.log(chalk.red.bold("密码: ") + password);

    await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message:
          "请妥善保存minio用户名密码（可记录至confluence页面）。确认保存后继续",
      },
    ]);

    // update compose yml

    // compose up

  });
