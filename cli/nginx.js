import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async (envId) => {
  console.log("1 ->>>>>>>>>>>>> nginx 初始化：\n");
  spinner.start("测试nginx中...");
  try {
    const { stderr: stderr, stdout: stdout } = await exec(
      `systemctl is-active nginx`
    );
    spinner.stop();
    console.log();
    if (stdout.trim() === "active") {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          default: false,
          message: "当前nginx已经启动，是否重新设置",
        },
      ]);
      if (!confirm) {
        spinner.stopAndPersist({
          symbol: chalk.green("✔"),
          text: chalk.green.bold("1 ->>>>>>>>>>>>> nginx 启动完成"),
        });
        return;
      }
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(chalk.blue.bold("1 ->>>>>>>>>>>>> 创建新nginx实例"));

  // $ENV_ID: 环境的ID
  const placeholderMapping = {
    $ENV_ID: envId,
  };

  // update compose yml
  await updateFile({
    placeholderMapping,
    filePath: "./nginx/nginx.conf.template",
    outputPath: "./nginx/nginx.conf",
  });

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up -d nginx`);
  console.log(stderr, stdout);
  const { stderr: pingErr, stdout: pingOut } = await exec(
    "systemctl is-active nginx"
  );
  console.log(pingErr, pingOut);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("1 ->>>>>>>>>>>>> nginx 启动完成"),
  });
};
