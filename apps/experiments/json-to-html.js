const fs = require("fs");
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;
let jsonContent = JSON.parse(fs.readFileSync("./htmlJson.json", "utf-8"));
let htmlFromJson = json2html(jsonContent);

console.log(htmlFromJson);

// const convert = (jsonContent) => {
//   jsonContent.forEach((item) => {
//     console.log(item);
//   });
// };

// convert(jsonContent);
