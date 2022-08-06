import { config } from "aws-sdk";
import S3 from "aws-sdk/clients/s3";

config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

export const s3 = folder =>
  new S3({
    params: {
      Bucket: `${process.env.REACT_APP_AWS_BUCKET_NAME}/${folder}`,
    },
    region: process.env.REACT_APP_AWS_REGION,
  });
