const uploadtoS3 = require("../functions/uploadToS3");
const setS3DownloadUrl = require("../functions/setS3DownloadUrl");
var uuid = require("uuid");

const beforePrepareCreateFiles = async (context) => {
  const { locoAction } = context;
  const { uploadedFile, mime } = locoAction.payload;
  let fileName = uuid.v4();
  const fileData = await uploadedFile.toBuffer();
  let result = await uploadtoS3(fileData, mime, fileName);
  locoAction.payload["path_to_file"] = result["Location"];
  locoAction.payload["uuid"] = fileName;
  context["locoAction"] = locoAction;
  return context;
};

const addDownloadUrlToFile = async (context) => {
  const { locoAction } = context;

  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  for (let index = 0; index < currentData.length; index++) {
    const element = currentData[index];
    currentData[index] = setS3DownloadUrl(element);
  }

  if (context.locoAction["opResult"]["data"] === undefined) {
    context.locoAction["opResult"] = currentData[0];
  } else {
    context.locoAction["opResult"]["data"] = currentData;
  }

  return context;
};

const beforeRespondCreateFiles = async (context) => {
  return addDownloadUrlToFile(context);
};

const beforeRespondReadFiles = async (context) => {
  return addDownloadUrlToFile(context);
};

module.exports = {
  beforePrepareCreateFiles,
  beforeRespondCreateFiles,
  beforeRespondReadFiles,
};
