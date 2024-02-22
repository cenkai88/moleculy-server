import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import randomize from "randomatic";
import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

export default async (envId) => {
  console.log("1 ->>>>>>>>>>>>> minio初始化：");

  const password = randomize("Aa0", 12);
  const passwordForApi = randomize("Aa0", 20);

  console.log(chalk.red.bold("用户名: ") + "ingsh");
  console.log(chalk.red.bold("密码: ") + password);
  console.log(chalk.red.bold("ingsh@dt密码: ") + passwordForApi);

  await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message:
        "请妥善保存minio用户名密码（可记录至confluence页面）。确认保存后继续",
    },
  ]);

  // $MINIO_ROOT_PASSWORD: 初始密码
  // $MINIO_WEBHOOK_DOMAIN: webhook的域名，根据envId来的
  // $MINIO_DT_SECRET
  const placeholderMapping = {
    $MINIO_ROOT_PASSWORD: password,
    $MINIO_WEBHOOK_DOMAIN: `web-${envId}.moleculy.com`,
    $MINIO_DT_SECRET: passwordForApi,
  };

  // update compose yml
  await updateFile({
    placeholderMapping,
    filePath: "./minio/compose.tmp.yml",
    outputPath: "./minio/compose.yml",
  });
  await updateFile({
    placeholderMapping,
    filePath: "./minio/init/init.sh.template",
    outputPath: "./minio/init/init.sh",
  });

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up -d minio`);
  console.log(stderr, stdout);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("1 ->>>>>>>>>>>>> minio启动完成"),
  });
};
