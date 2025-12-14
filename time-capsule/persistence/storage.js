import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.BUCKET;
const CDN = process.env.CDN;

const s3Client = new S3Client({});

export const uploadImageToS3 = async (fileBuffer, fileName, contentType) => {
    const uploadParams = {
        Bucket: BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
    };

    try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        return `https://${CDN}/${fileName}`;

    } catch (error) {
        console.log("S3 업로드 오류:", error);
        throw new Error("이미지 파일을 S3에 업로드하는 데 실패했습니다.");
    }
}

export const deleteImageFromS3 = async (fileUrl) => {
    const deleteParams = {
        Bucket: BUCKET,
        Key: fileUrl.replace(`https://${CDN}/`, "")
    };

    try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
        console.log("S3 삭제 오류:", error);
        throw new Error(`S3에서 객체 ${key}를 삭제하는 데 실패했습니다.`);
    }
};