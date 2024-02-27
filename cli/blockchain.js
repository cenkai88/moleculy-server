import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
// import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async (envId, localIp) => {
  console.log("4 ->>>>>>>>>>>>> blockchain 初始化：\n");
  spinner.start("测试blockchain中...");
  try {
    const { stdout: stdout } = await exec(`curl -X OPTIONS ${localIp}:9933`);
    spinner.stop();
    console.log();
    if (
      stdout.trim() ===
      `{"jsonrpc":"2.0","error":{"code":-32700,"message":"Parse error"},"id":null}`
    ) {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          default: false,
          message: "当前blockchain已经启动，是否重新设置",
        },
      ]);
      if (!confirm) {
        spinner.stopAndPersist({
          symbol: chalk.green("✔"),
          text: chalk.green.bold("4 ->>>>>>>>>>>>> blockchain 启动完成"),
        });
        return;
      }
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(chalk.blue.bold("4 ->>>>>>>>>>>>> 创建新blockchain实例"));

  // update compose yml
  // await updateFile({
  //   placeholderMapping,
  //   filePath: "./blockchain/blockchain.tmp.yml",
  //   outputPath: "./blockchain/blockchain.yml",
  // });

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up -d blockchain`);
  console.log(stderr, stdout);
  const { stderr: pingErr, stdout: pingOut } = await exec(`curl -X OPTIONS ${localIp}:9933`);
  console.log(pingErr, pingOut);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("4 ->>>>>>>>>>>>> blockchain 启动完成"),
  });
};
