const AWS = require("aws-sdk");
const s3 = new AWS.S3({ signatureVersion: "v4" });

const setS3DownloadUrl = (file) => {
  const myURL = new URL(file["path_to_file"]);

  let params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: myURL.pathname.slice(1),
    Expires: 600,
    ResponseContentDisposition:
      'attachment; filename ="' + file["file_name"] + '"',
  };

  const signedUrl = s3.getSignedUrl("getObject", params);

  file["download_url"] = signedUrl;

  return file;
};

module.exports = setS3DownloadUrl;
