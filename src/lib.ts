import { IncomingMessage } from 'http';
import { ClientHttp2Stream } from 'http2';

const isJsonRe = /^application\/(?:.+\+|)json(?:;.+|)$/iu;

export const handleResponse = <ResultType>(res: ClientHttp2Stream | IncomingMessage, statusCode: number, contentType: string) => {
  return new Promise<ResultType>((resolve, reject) => {
    const chunks: Buffer[] = [];
    res.on('data', (chunk) => chunks.push(chunk as Buffer));

    res.on('end', () => {
      const body = Buffer.concat(chunks).toString();

      if (statusCode === undefined || statusCode >= 400 || statusCode < 200) {
        reject(new Error(body));
      } else if (contentType !== undefined && isJsonRe.test(contentType)) {
        resolve(JSON.parse(body) as ResultType);
      } else {
        resolve(body as unknown as ResultType);
      }
    });
  });
}
