/**
 * Simple script for updating the resources file
 */

import fs from "fs"
//import "dotenv/config"

import conversions from "./mode/conversions.js"
import crafting from "./mode/crafting.js"
import { exit } from "process";

let access_token;

function jsonToAscii(jsonText) {
  let s = "";

  for (let i = 0; i < jsonText.length; ++i) {
    let c = jsonText[i];
    if (c >= '\x7F') {
      c = c.charCodeAt(0).toString(16).toUpperCase();
      switch (c.length) {
        case 2:
          c = "\\u00" + c;
          break;
        case 3:
          c = "\\u0" + c;
          break;
        default:
          c = "\\u" + c;
          break;
      }
    }
    s += c;
  }
  return s;
}

const run = async (autoUpdate = false) => {
  let resources
  let filePath;
  try{
    resources = JSON.parse(fs.readFileSync("../resources.json"));
    filePath = "../resources.json"
  }catch{
    resources = JSON.parse(fs.readFileSync("resources.json"))
    filePath = "resources.json"
  }
  

  await conversions.update(resources, true)
  await conversions.full_check(resources, access_token, true)
  await crafting.update(resources, access_token, true)

  if (autoUpdate) {
    fs.writeFile(filePath,
        jsonToAscii(JSON.stringify(resources, null, '\t')), () => {
        });
  } else {
    console.log(jsonToAscii(JSON.stringify(resources, null, '\t')))
  }
}

if (process.argv.length > 2) {
  access_token = process.argv[2]
}else{
  access_token = ""
}

run(true);
