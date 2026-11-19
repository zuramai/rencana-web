import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let client: S3Client | undefined

function s3() {
  const { s3: config } = useRuntimeConfig()
  client ??= new S3Client({
    endpoint: config.endpoint || undefined,
    region: config.region,
    forcePathStyle: config.forcePathStyle === true || String(config.forcePathStyle) === 'true',
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
  })
  return { client, bucket: config.bucket }
}

export async function putObject(key: string, body: Uint8Array | Buffer, contentType: string): Promise<void> {
  const { client, bucket } = s3()
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
}

export async function getObjectBytes(key: string): Promise<Uint8Array> {
  const { client, bucket } = s3()
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!res.Body) throw new Error(`Empty S3 object: ${key}`)
  return res.Body.transformToByteArray()
}

export async function deleteObjects(keys: string[]): Promise<void> {
  const { client, bucket } = s3()
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000)
    await client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: chunk.map(Key => ({ Key })), Quiet: true }
    }))
  }
}

export async function presignGet(key: string, seconds = 300): Promise<string> {
  const { client, bucket } = s3()
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds })
}
