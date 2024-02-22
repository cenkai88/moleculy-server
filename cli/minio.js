import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import fs from "fs";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import randomize from "randomatic";
import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);
const spinner = ora();

export default async (envId) => {
  console.log("1 ->>>>>>>>>>>>> minio 初始化：");

  spinner.start("尝试查看minio实例中...");
  try {
    const { stderr: pingErr0, stdout: pingOut0 } = await exec(
      "curl -f http://localhost:9000/minio/health/live"
    );
    spinner.stop();
    console.log();
    console.log(pingErr0, pingOut0);
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        default: false,
        message: "当前已经存在minio实例，是否重新设置",
      },
    ]);
    if (!confirm) {
      spinner.stopAndPersist({
        symbol: chalk.green("✔"),
        text: chalk.green.bold("1 ->>>>>>>>>>>>> minio 启动完成"),
      });
      return;
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(chalk.blue.bold("1 ->>>>>>>>>>>>> 创建新minio实例"));
  const password = randomize("Aa0", 12);
  const passwordForApi = randomize("Aa0", 20);

  console.log(chalk.red.bold("用户名: ") + "ingsh");
  console.log(chalk.red.bold("密码: ") + password);
  console.log();
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

  // set script as executable
  fs.chmodSync("./minio/init/init.sh", 0o755);

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up minio minio-init`);
  console.log(stderr, stdout);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("1 ->>>>>>>>>>>>> minio启动完成"),
  });
};
