const resolvePayload = async (locoRoute, frameworkData) => {
  if (locoRoute.resource === "files" && locoRoute.action === "create") {
    // let file = await frameworkData.req.file();
    // console.log("file", frameworkData.reqQuery["owner_service"]);
    let uploadedFile = await frameworkData.req.file();
    return {
      ...frameworkData.reqQuery,
      uploadedFile,
      file_name: uploadedFile.filename,
      mime: uploadedFile.mimetype,
    };
  }

  return frameworkData.reqBody;
};

module.exports = resolvePayload;
