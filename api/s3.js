const { S3Client, ListObjectsV2Command, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: "ap-northeast-1",
  endpoint: "https://objectstorageapi.ap-northeast-1.clawcloudrun.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

export default async function handler(req, res) {
  const { action, bucket } = req.query;

  try {
    if (action === "list") {
      const command = new ListObjectsV2Command({ Bucket: bucket });
      const data = await s3.send(command);
      return res.status(200).json(data.Contents || []);
    } 
    
    if (action === "uploadUrl") {
      const { fileName, fileType } = req.query;
      const command = new PutObjectCommand({ Bucket: bucket, Key: fileName, ContentType: fileType });
      // 生成一个给前端用的临时上传链接，有效期 60 秒
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      return res.status(200).json({ url });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
