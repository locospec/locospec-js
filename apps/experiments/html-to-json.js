const fs = require("fs");
var html2json = require("html2json").html2json;
var json2html = require("html2json").json2html;
let htmlContent = fs.readFileSync("./jsonHtml.html", "utf-8");
let jsonFromHtml = html2json(htmlContent);

console.log(jsonFromHtml);

fs.writeFileSync("./htmlJson.json", JSON.stringify(jsonFromHtml));

// const convert = (jsonContent) => {
//   jsonContent.forEach((item) => {
//     console.log(item);
//   });
// };

// convert(jsonContent);
