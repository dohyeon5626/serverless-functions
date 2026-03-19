import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.BUCKET as string;
const CDN = process.env.CDN as string;

const s3Client = new S3Client({});

export const uploadImageToS3 = async (fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> => {
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    }));
    return `https://${CDN}/${fileName}`;
  } catch (error) {
    console.log('S3 업로드 오류:', error);
    throw new Error('이미지 파일을 S3에 업로드하는 데 실패했습니다.');
  }
};

export const deleteImageFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileUrl.replace(`https://${CDN}/`, ''),
    }));
  } catch (error) {
    console.log('S3 삭제 오류:', error);
    throw new Error(`S3에서 객체 ${fileUrl}를 삭제하는 데 실패했습니다.`);
  }
};
