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
  console.log("4 ->>>>>>>>>>>>> blockchain 初始化：\n");
  spinner.start("测试blockchain中...");
  try {
    const { stdout: stdout } = await exec(`curl -X OPTIONS localhost:9933`);
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
  spinner.start("启动中，blockchain的Image比较大，请耐心等待...");
  await exec(`sudo docker-compose up -d blockchain`);
  await exec(`sleep 5`);
  const { stdout } = await exec(`sudo docker logs blockchain`);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("4 ->>>>>>>>>>>>> blockchain 启动完成"),
  });
  const { auraSecret, auraAccount, granSecret, granAccount } =
    extractBlockChainKeys(stdout);

  if (auraSecret && auraAccount && granSecret && granAccount) {
    console.log(`当前blockchain的凭证如下，请妥善保管`);
    console.log(chalk.red.bold("Aura Secret:"), auraSecret);
    console.log(chalk.red.bold("Aura Account:"), auraAccount);
    console.log(chalk.red.bold("Gran Secret:"), granSecret);
    console.log(chalk.red.bold("Gran Account:"), granAccount);
  }

  // update phrase for blockchain API
  const placeholderMapping = {
    $BLOCKCHAIN_PHRASE: `"${auraSecret}"`
  }
  await updateFile({
    placeholderMapping,
    filePath: "./thumbnail/compose.tmp.yml",
    outputPath: "./thumbnail/compose.yml",
  });
};
