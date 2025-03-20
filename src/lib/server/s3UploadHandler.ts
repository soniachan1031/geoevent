import sharp from "sharp";
import AppError from "./AppError";
import { AWS_S3_BUCKET } from "../credentials";
import AppResponse from "./AppResponse";
import { randomUUID } from "crypto";
import { ListObjectsV2Request } from "aws-sdk/clients/s3";
import s3Instance from "./s3ClientInstance";

const s3 = s3Instance();

/**
 * Uploads an image file to Amazon S3 with specified dimensions and size limit.
 *
 * @param  options - The options for uploading the image.
 * @param  options.file - The image file to be uploaded.
 * @param  options.key - The key for the image object in S3.
 * @param  options.width - The desired width of the image.
 * @param  options.height - The desired height of the image.
 * @param  options.limit=[5 * 1024 * 1024] - The maximum size of the image file in bytes.
 * @return  - The key of the uploaded image.
 * @throws {AppError} - If the file is not an image or exceeds the size limit. (5MB)
 * @throws {AppError} - If there is an error during the S3 upload process.
 */
export const uploadImageToS3 = async ({
  file,
  key,
  resize,
  limit = 5 * 1024 * 1024,
}: {
  file: File;
  key: string;
  resize?: {
    width?: number;
    height?: number;
  };
  limit?: number;
}): Promise<string> => {
  try {
    // check file type
    if (!file.type.startsWith("image/")) {
      throw new AppError(400, "file must be an image");
    }

    // check file size
    if (file.size > limit) {
      throw new AppError(
        400,
        `file size must be less than ${limit / 1024 / 1024}MB`
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer;
    if (resize) {
      buffer = await sharp(arrayBuffer)
        .resize({
          width: resize.width,
          height: resize.height,
          fit: "cover",
          position: "center",
        })
        .toBuffer();
    } else {
      buffer = await sharp(arrayBuffer).toBuffer();
    }

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (error: any) {
    throw new AppError(400, error.message ?? "s3 upload error");
  }
};

/**
 * Recursively clears an S3 folder and its subfolders by deleting all objects.
 *
 * @param folder - The folder prefix (path) in the S3 bucket to clear.
 * @param s3 - Optional. An instance of AWS.S3 configured with your AWS credentials and region.
 * @returns Promise<void>
 */
export const clearS3Folder = async (folder: string) => {
  const deleteObjects = async (keys: string[]) => {
    if (keys.length === 0) return;

    const deleteParams = {
      Bucket: AWS_S3_BUCKET,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: false,
      },
    };

    await s3.deleteObjects(deleteParams).promise();
  };

  const deleteAllObjects = async (prefix: string) => {
    let continuationToken: string | undefined = undefined;
    let allKeys: string[] = [];

    do {
      const listParams: ListObjectsV2Request = {
        Bucket: AWS_S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      };

      const listResponse = await s3.listObjectsV2(listParams).promise();

      if (listResponse.Contents) {
        const keys = listResponse.Contents.map(
          (object) => object.Key as string
        );
        allKeys = allKeys.concat(keys);
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    await deleteObjects(allKeys);
  };

  await deleteAllObjects(folder);
};

/**
 * Uploads an image to Amazon S3.
 *
 * @param options - The options for uploading the profile picture.
 * @param options.file - The picture to be uploaded.
 * @param  options.docId - The ID of the user.
 * @param options.width - The desired width of the picture.
 * @param  options.height - The desired height of the picture.
 * @return  The key of the uploaded picture.
 * @throws If the file type is invalid.
 */

export const uploadImage = async ({
  file,
  folder,
  width,
  height,
}: {
  file: File;
  folder: string;
  width?: number;
  height?: number;
}) => {
  // check if file type is valid
  if (!file.type.startsWith("image/")) {
    throw new AppResponse(400, "invalid file type");
  }

  // get file extension
  const ex = file.type.split("/")[1];

  const acceptedEx = ["jpg", "jpeg", "png"];

  // check if file extension is valid
  if (!ex || !acceptedEx.includes(ex)) {
    throw new AppResponse(400, "invalid file type");
  }

  // clear folder before upload
  await clearS3Folder(folder);

  // generate random key
  const key = `${folder}/${randomUUID()}.${ex}`;

  // upload image
  const imageUrl = await uploadImageToS3({
    file,
    key,
    resize: { width, height },
  });

  return imageUrl;
};

export const uploadImagesToS3 = async ({
  files,
  folder,
  resize,
  clearFolderBeforeUpload = false,
}: {
  files: File[];
  folder: string;
  resize?: {
    width: number;
    height: number;
  };
  clearFolderBeforeUpload?: boolean;
}): Promise<string[]> => {
  try {
    if (clearFolderBeforeUpload) {
      await clearS3Folder(folder);
    }

    const promises = files.map(async (file) => {
      // check if file type is valid
      if (!file.type.startsWith("image/")) {
        throw new AppResponse(400, "invalid file type");
      }

      // get file extension
      const ex = file.type.split("/")[1];

      const acceptedEx = ["jpg", "jpeg", "png"];

      // check if file extension is valid
      if (!ex || !acceptedEx.includes(ex)) {
        throw new AppResponse(400, "invalid file type");
      }

      // generate random key
      const key = `${folder}/${randomUUID()}.${ex}`;

      // upload image
      const params = resize ? { file, key, resize } : { file, key };
      const imageUrl = await uploadImageToS3(params);

      return imageUrl;
    });

    return await Promise.all(promises);
  } catch (error: any) {
    throw new AppError(400, error.message ?? "s3 upload error");
  }
};
