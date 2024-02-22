import inquirer from "inquirer";
import { exec as execRaw } from "child_process";
import util from "node:util";
import chalk from "chalk";
import ora from "ora";
import { updateFile } from "./utils.js";

const exec = util.promisify(execRaw);

const spinner = ora();

export default async () => {
  console.log("0 ->>>>>>>>>>>>> VPN 初始化：\n");
  spinner.start("测试VPN网络中...");
  try {
    const { stderr: pingErr0, stdout: pingOut0 } = await exec(
      "ping -c 4 10.7.0.1"
    );
    spinner.stop();
    console.log();
    console.log(pingErr0, pingOut0);
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "当前VPN已经联通，是否重新设置",
      },
    ]);
    if (!confirm) {
      spinner.stopAndPersist({
        symbol: chalk.green("✔"),
        text: chalk.green.bold("0 ->>>>>>>>>>>>> VPN 启动完成"),
      });
      return;
    }
  } catch (err) {
    // proceed
  }

  console.log(chalk.blue.bold("0 ->>>>>>>>>>>>> 创建新wireguard实例"));
  const { ip } = await inquirer.prompt([
    {
      type: "input",
      name: "ip",
      message: "请输入VPN IP地址",
      default: "10.7.0.8/24",
    },
  ]);
  const { stdout: privateKey } = await exec("wg genkey");
  const { stdout: publicKey } = await exec(
    `echo ${privateKey.trim()} | wg pubkey`
  );
  const { stdout: uid } = await exec(`id -u`);
  const { stdout: gid } = await exec(`id -g`);
  console.log(chalk.red.bold("Public Key: ") + publicKey.trim());
  console.log(chalk.red.bold("IP: ") + ip);
  await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "请告知VPN管理员，添加配置后继续",
    },
  ]);

  // $PUID: User id
  // $PGID: User group id
  // $VPN_IP: client IP地址
  // $VPN_PRIVATE_KEY: VPN私钥
  const placeholderMapping = {
    $PUID: uid.trim(),
    $PGID: gid.trim(),
    $VPN_IP: ip,
    $VPN_PRIVATE_KEY: privateKey.trim(),
  };

  // update compose yml
  await updateFile({
    placeholderMapping,
    filePath: "./wireguard/compose.tmp.yml",
    outputPath: "./wireguard/compose.yml",
  });
  await updateFile({
    placeholderMapping,
    filePath: "./wireguard/config/wg0.template",
    outputPath: "./wireguard/config/wg0.conf",
  });

  // compose up
  spinner.start("启动中...");
  const { stderr, stdout } = await exec(`sudo docker-compose up wireguard`);
  console.log(stderr, stdout);
  const { stderr: pingErr, stdout: pingOut } = await exec("ping -c 4 10.7.0.1");
  console.log(pingErr, pingOut);
  spinner.stopAndPersist({
    symbol: chalk.green("✔"),
    text: chalk.green.bold("0 ->>>>>>>>>>>>> VPN 启动完成"),
  });
};
