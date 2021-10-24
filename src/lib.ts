import { IncomingMessage } from 'http';
import { ClientHttp2Stream } from 'http2';

const isJsonRe = /^application\/(?:.+\+|)json(?:;.+|)$/iu;

export const handleResponse = <ResultType>(res: ClientHttp2Stream | IncomingMessage, statusCode: number, contentType: string, returnBuffer = false) => {
  return new Promise<ResultType>((resolve, reject) => {
    const chunks: Buffer[] = [];
    res.on('data', (chunk) => chunks.push(chunk as Buffer));

    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const body = returnBuffer ? buffer : buffer.toString();

      if (statusCode === undefined || statusCode >= 400 || statusCode < 200) {
        reject(new Error(body.toString()));
      } else if (returnBuffer === false && contentType !== undefined && isJsonRe.test(contentType)) {
        resolve(JSON.parse(body.toString()) as ResultType);
      } else {
        resolve(body as unknown as ResultType);
      }
    });
  });
}
