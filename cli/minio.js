import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import fs from "fs";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import randomize from "randomatic";
import { extractKeys, updateFile } from "./utils.js";

const exec = util.promisify(execRaw);
const spinner = ora();

const waitUntilMinioHealthy = async () =>
  new Promise((resolve, reject) => {
    let count = 1;
    const t = setInterval(async () => {
      if (count > 20) {
        console.error("minio health check失败");
        reject();
      }
      try {
        await exec(`curl -sSf http://localhost:9000/minio/health/live`);
        clearInterval(t);
        resolve();
      } catch (err) {
        count += 1;
      }
    }, 1000);
  });

export default async (envId) => {
  console.log("3 ->>>>>>>>>>>>> minio 初始化：");

  spinner.start("尝试查看minio实例中...");
  try {
    const { stderr: pingErr0, stdout: pingOut0 } = await exec(
      "curl -f http://localhost:9000/minio/health/live"
    );
    spinner.stop();
    console.log();
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
        text: chalk.green.bold("3 ->>>>>>>>>>>>> minio 启动完成"),
      });
      return;
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(chalk.blue.bold("3 ->>>>>>>>>>>>> 创建新minio实例"));
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
  const { stderr, stdout } = await exec(`sudo docker-compose up -d minio`);
  console.log(stderr, stdout);
  console.log(chalk.blue.bold("3 ->>>>>>>>>>>>> minio 实例启动完成"));

  spinner.start("初始化minio中，等待minio health check...");
  await waitUntilMinioHealthy();
  console.log("minio health check完成");
  spinner.stop();

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "是否自动创建minio buckets / users / webhooks",
    },
  ]);

  if (confirm) {
    const { stderr: stderrInit, stdout: stdoutInit } = await exec(
      `sudo docker-compose up minio-init`
    );
    console.log(stderrInit, stdoutInit);
    spinner.stopAndPersist({
      symbol: chalk.green("✔"),
      text: chalk.green.bold("3 ->>>>>>>>>>>>> minio 实例初始化完成"),
    });

    const keys = extractKeys(stdoutInit);
    if (keys) {
      console.log(`ingsh@dt的凭证如下，请妥善保管`);
      console.log(chalk.red.bold("Access Key:"), keys.accessKey);
      console.log(chalk.red.bold("Secret Key:"), keys.secretKey);
      // the file needs to be updated by blockchain also
      await updateFile({
        placeholderMapping: {
          $MINIO_KEY: keys.accessKey,
          $MINIO_SECRET: keys.secretKey,
        },
        filePath: "../thumbnail/compose.tmp.yml",
        outputPath: "./thumbnail/compose.yml",
      });
    }
  }
};
