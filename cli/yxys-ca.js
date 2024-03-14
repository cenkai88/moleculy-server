import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async (envId, localIp) => {
  console.log("1 ->>>>>>>>>>>>> certs and domain 初始化：\n");
  spinner.start("测试中...");
  try {
    const { stdout } = await exec(
      `docker ps -a --filter="name=yxys-ca" --format="{{.Names}}"`,
    );
    spinner.stop();
    if (stdout.trim() === "yxys-ca") {
      chalk.green.bold("1 ->>>>>>>>>>>>> certs and domain 已经启动");
      return;
    }
  } catch (err) {
    spinner.stop();
    console.log("err", err);
    return;
    // proceed
  }

  console.log(chalk.blue.bold("1 ->>>>>>>>>>>>> 创建certs and domain实例"));

  // $ENV_ID: 环境的ID
  // $LOCAL_IP: 机器内网IP
  const placeholderMapping = {
    $LOCAL_IP: localIp,
    $ENV_ID: envId,
  };

  // update compose yml
  await updateFile({
    placeholderMapping,
    filePath: "./yxys-ca/.env.template",
    outputPath: "./yxys-ca/.env",
  });
  console.log(
    chalk.yellow(
      `请输入以下信息用于更新证书和域名,你也可以在后面直接修改"./yxys-ca/.env"来修改配置：`,
    ),
  );

  // AWS_BUCKET=yxys-ssl
  // AWS_ACCESS_KEY=AKIA3CRYVFQIXY37ITWJ
  // AWS_SECRET_KEY=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
  // AWS_REGIN=cn-northwest-1
  const { tencentId, tencentKey, awsBucket, awsRegion, awsAccessKey, awsSecretKey } = await inquirer.prompt([
    {
      type: "input",
      name: "tencentId",
      message: "腾讯 secret ID",
    },
    {
      type: "input",
      name: "tencentKey",
      message: "腾讯 secret Key",
    },
    {
      type: "input",
      name: "awsBucket",
      message: "AWS ssl Bucket name",
      default: "yxys-ssl",
    },
    {
      type: "input",
      name: "awsRegion",
      message: "AWS region",
      default: "cn-northwest-1",
    },
    {
      type: "input",
      name: "awsAccessKey",
      message: "AWS access Key",
    },
    {
      type: "input",
      name: "awsSecretKey",
      message: "AWS secret Key",
    },
  ]);
  try {
    await exec(`echo "TENCENT_SECRET_ID=${tencentId}" >> ./yxys-ca/.env`);
    await exec(`echo "TENCENT_SECRET_KEY=${tencentKey}" >> ./yxys-ca/.env`);
    await exec(`echo "AWS_BUCKET=${awsBucket}" >> ./yxys-ca/.env`);
    await exec(`echo "AWS_REGIN=${awsRegion}" >> ./yxys-ca/.env`);
    await exec(`echo "AWS_ACCESS_KEY=${awsAccessKey}" >> ./yxys-ca/.env`);
    await exec(`echo "AWS_SECRET_KEY=${awsSecretKey}" >> ./yxys-ca/.env`);
  } catch (err) {
    console.log("err", err);
    return;
  }
  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`docker-compose up yxys-ca`);
  console.log(stderr, stdout);

  // add cron job, so docker will be restart
  try {
    // 每隔6小时执行一次
    await exec(`echo "0 */6 * * * root docker start yxys-ca" > /etc/cron.d/yxys-ca`);
  } catch (err) {
    console.log("err", err);
    return;
  }
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("1 ->>>>>>>>>>>>> certs and domains 启动完成"),
  });
};
