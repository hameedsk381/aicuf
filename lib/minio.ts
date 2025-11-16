import { Client } from "minio"

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "aicuf-uploads"

// Singleton pattern for MinIO client
let minioInstance: Client | null = null

function getMinioClient() {
  if (!process.env.MINIO_ENDPOINT) {
    throw new Error("MINIO_ENDPOINT is required in .env file")
  }

  if (!process.env.MINIO_ACCESS_KEY) {
    throw new Error("MINIO_ACCESS_KEY is required in .env file")
  }

  if (!process.env.MINIO_SECRET_KEY) {
    throw new Error("MINIO_SECRET_KEY is required in .env file")
  }

  if (!minioInstance) {
    minioInstance = new Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT || "9000"),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    })

    // Try to initialize bucket in background (non-blocking)
    if (typeof window === "undefined") {
      ensureBucket().catch((error) => {
        console.warn("MinIO bucket initialization skipped:", error.message)
      })
    }
  }

  return minioInstance
}

// Initialize bucket if it doesn't exist
async function ensureBucket() {
  const client = getMinioClient()
  try {
    const exists = await client.bucketExists(BUCKET_NAME)
    if (!exists) {
      await client.makeBucket(BUCKET_NAME, "us-east-1")
      
      // Set public read policy for the bucket
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      }
      await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error)
  }
}

// Export lazy getter
export const minioClient = new Proxy({} as Client, {
  get(target, prop) {
    const client = getMinioClient()
    return (client as any)[prop]
  }
})

export { BUCKET_NAME }
