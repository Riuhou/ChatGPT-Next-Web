const { nodeFileTrace } = require("@vercel/nft");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

const arg = require("minimist")(process.argv.splice(2));
console.log("arguments", arg);

const files = [path.join(__dirname, "server.js")];

const packjson = path.join(__dirname, "../package.json");
const standalone = path.join(__dirname, "../.next/standalone/node_modules");
const nextDir = path.join(__dirname, "../.next");
const serverDir = path.join(__dirname, "../server");
const publicDir = path.join(__dirname, "../public");
const distDir = path.join(__dirname, "../dist");
const node_modules_dist = path.join(__dirname, "../dist/node_modules");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true }, (err) => {
    console.error(err);
  });
}

function copyMn() {
  fse.copyFileSync(packjson, `${distDir}/package.json`);
  fse.copySync(standalone, node_modules_dist, { overwrite: true });
  fse.copySync(publicDir, `${distDir}/public`, { overwrite: true });
  fse.copySync(serverDir, `${distDir}/server`, { overwrite: true });
  fse.copySync(nextDir, `${distDir}/.next`, {
    overwrite: true,
    filter(src, dest) {
      // 过滤文件
      if (
        src.includes(".next/standalone") ||
        src.includes(".next/cache/webpack")
      ) {
        return;
      }
      return true;
    },
  });
}

async function getFileList() {
  const { fileList } = await nodeFileTrace(files);

  for (const p of fileList) {
    if (!p.startsWith("node_modules")) continue;
    const distPath = p.replace(/^node_modules/, "./dist/node_modules");
    const dir = path.dirname(distPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }, (err) => {
        console.error(err);
      });
    }

    fse.copyFileSync(p, distPath, { overwrite: true });
  }
}

const run = () => {
  if (fs.existsSync(node_modules_dist) && !arg.f) return;
  copyMn();
  getFileList();
};

run();
