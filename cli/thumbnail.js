import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import { extractBlockChainKeys } from "./utils.js";
// import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async () => {
  console.log("5 ->>>>>>>>>>>>> thumbnail+blockchain API 初始化：\n");
  spinner.start("测试 thumbnail+blockchain API 中...");
  try {
    const { stdout: stdout } = await exec(
      `curl http://localhost:3001/thumbnail/healthcheck`
    );
    spinner.stop();
    console.log();
    if (stdout.trim() === "{ status: 'ok' }") {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          default: false,
          message: "当前 thumbnail+blockchain API 已经启动，是否重新设置",
        },
      ]);
      if (!confirm) {
        spinner.stopAndPersist({
          symbol: chalk.green("✔"),
          text: chalk.green.bold(
            "5 ->>>>>>>>>>>>> thumbnail+blockchain API 启动完成"
          ),
        });
        return;
      }
    }
  } catch (err) {
    spinner.stop();
    // proceed
  }

  console.log(
    chalk.blue.bold("5 ->>>>>>>>>>>>> 创建新 thumbnail+blockchain API 实例")
  );

  // update compose yml
  // await updateFile({
  //   placeholderMapping,
  //   filePath: "./blockchain/blockchain.tmp.yml",
  //   outputPath: "./blockchain/blockchain.yml",
  // });

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up -d thumbnail`);
  console.log(stderr, stdout);
  const { stderr: stderrCurl, stdout: stdoutCurl } = await exec(
    `curl http://localhost:3001/thumbnail/healthcheck`
  );
  console.log(stderrCurl, stdoutCurl);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold(
      "5 ->>>>>>>>>>>>> thumbnail+blockchain API 启动完成"
    ),
  });
};
