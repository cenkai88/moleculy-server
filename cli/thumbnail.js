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
  const { blockchainNodeName } = await inquirer.prompt([
    {
      type: "input",
      name: "blockchainNodeName",
      message: "请输入区块链节点名称，一般是poe-xxx, 默认: poe-unknown",
      default: "poe-unknown",
    },
  ]);
  try {
    spinner.start("测试 thumbnail+blockchain API 中...");
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

  // update phrase for blockchain API
  const placeholderMapping = {
    $BLOCKCHAIN_NODE_NAME: `"${blockchainNodeName}"`,
  };
  // the file has been renamed by minio already
  await updateFile({
    placeholderMapping,
    filePath: "./thumbnail/compose.yml",
    outputPath: "./thumbnail/compose.yml",
  });

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
