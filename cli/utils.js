import fs from "fs";

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
