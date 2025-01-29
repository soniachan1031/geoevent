import S3 from "aws-sdk/clients/s3";
import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../credentials";

export default function s3ClientInstance() {
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    signatureVersion: "v4",
  });

  return s3;
}
