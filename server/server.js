const next = require("../node_modules/next");
const express = require("express");
// const { parse } = require('url');
// const { createServer } = require('http');
const path = require("path");
// const config = require('../next.config');
const fs = require("fs");
// const { execSync } = require('child_process');

const port = process.env.FC_SERVER_PORT || 3000;
const app = next({ dev: false });
const server = express();
const handle = app.getRequestHandler();

// const nextConfig = config();
const fcVersion = process.env.FC_QUALIFIER;
// console.log('node 版本', process.version, process.env.NODE_ENV, config());
console.log(`FC环境: ${fcVersion}, NODE_ENV: ${process.env.NODE_ENV}`);

/** 创建fc上的node_modules软链 */
if (fcVersion) {
  const envPath = path.join(__dirname, "../.env.local");
  let data = "";
  Object.entries(process.env).map(([key, value]) => {
    if (!key.startsWith("FC")) return;
    const v = `${key}=${value} \n`;
    data += v;
  });
  fs.writeFile(envPath, data, "utf-8", (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
}

// // json请求
// server.use(express.json());
// // 表单请求
// server.use(express.urlencoded({ extended: false }));
// // server.use(cookieParser());

// server.disable("x-powered-by");
// server.set("trust proxy", true);

app.prepare().then(() => {
  server.all("*", (req, res) => {
    console.log(`FC环境: ${fcVersion}, 请求url: ${req.url}, 请求ip: ${req.ip}`);
    // console.log('req.user', req.user);
    // console.log('NEXT_PUBLIC_FC_VERSION', process.env.NEXT_PUBLIC_FC_VERSION);
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});
