import fs from "fs";
import os from "os";

export const updateFile = async ({
  placeholderMapping = {},
  filePath,
  outputPath,
}) => {
  const data = await fs.readFileSync(filePath, "utf-8");
  let result = data;
  Object.keys(placeholderMapping).forEach((key) => {
    result = result.replaceAll(key, placeholderMapping[key]);
  });
  await fs.writeFileSync(outputPath, result, "utf-8");
};

export const getIntranetIp = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const addrList = networkInterfaces[interfaceName];
    for (const addr of addrList) {
      if (addr.family === "IPv4" && !addr.internal) return addr.address;
    }
  }
};

export const extractKeys = (output) => {
  const accessKeyRegex = /Access Key: (\w+)/;
  const secretKeyRegex = /Secret Key: (\w+)/;

  const accessKeyMatch = output.match(accessKeyRegex);
  const secretKeyMatch = output.match(secretKeyRegex);

  if (accessKeyMatch && secretKeyMatch) {
    return {
      accessKey: accessKeyMatch[1],
      secretKey: secretKeyMatch[1],
    };
  }
};

export const extractBlockChainKeys = (output) => {
  const aruaSecretRegex = /Aura Secret phrase: (\w+)/;
  const auraAccountRegex = /Aura Account ID: (\w+)/;
  const granSecretRegex = /Gran Secret phrase: (\w+)/;
  const granAccountRegex = /Gran Account ID: (\w+)/;

  const auraSecretMatch = output.match(aruaSecretRegex);
  const auraAccountMatch = output.match(auraAccountRegex);
  const granSecretMatch = output.match(granSecretRegex);
  const granAccountMatch = output.match(granAccountRegex);

  if (
    auraSecretMatch &&
    auraAccountMatch &&
    granSecretMatch &&
    granAccountMatch
  ) {
    return {
      auraSecret: auraSecretMatch[1],
      auraAccount: auraAccountMatch[1],
      granSecret: granSecretMatch[1],
      granAccount: granAccountMatch[1],
    };
  }
};
