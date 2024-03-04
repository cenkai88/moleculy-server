import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async () => {
  console.log("6 ->>>>>>>>>>>>> prometheus exporter 初始化：\n");
  spinner.start("测试prometheus exporter中...");
  try {
    await exec(`curl localhost:9100`);
    spinner.stop();
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        default: false,
        message: "当前prometheus exporter已经启动，是否重新设置",
      },
    ]);
    if (!confirm) {
      spinner.stopAndPersist({
        symbol: chalk.green("✔"),
        text: chalk.green.bold("6 ->>>>>>>>>>>>> prometheus exporter 启动完成"),
      });
      return;
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(chalk.blue.bold("6 ->>>>>>>>>>>>> 创建新prometheus exporter实例"));

  // compose up
  spinner.start("启动中...");
  await exec(`sudo docker-compose up -d prometheus-exporter`);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("6 ->>>>>>>>>>>>> prometheus exporter 启动完成"),
  });
};
