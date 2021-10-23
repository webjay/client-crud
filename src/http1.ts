import { Agent as HttpsAgent, request as httpsRequest, RequestOptions } from 'https';
import { handleResponse } from './lib';

const userAgent = `Node${process.versions.node}/https.request client-crud`;

const agent = new HttpsAgent({ keepAlive: true });

const requestOptions = (options: RequestOptions) => {
  return {
    agent,
    headers: {
      'user-agent': userAgent,
      'content-type': 'application/json; charset=utf-8',
      ...options.headers,
    },
    ...options,
  };
};

const request = <ResultType>(
  options: RequestOptions,
  data?: unknown
): Promise<ResultType> => {
  return new Promise<ResultType>((resolve, reject) => {
    const dataStringified = data !== undefined ? JSON.stringify(data) : undefined;

    const req = httpsRequest(
      requestOptions(options),
      (res) => {
        const {
          statusCode = -1,
          headers: { 'content-type': contentType = '' },
        } = res;

        handleResponse<ResultType>(res, statusCode, contentType).then(resolve).catch(reject);
      }
    );

    req.on('error', (error: NodeJS.ErrnoException) => {
      // @ts-expect-error `@types/node` has incomplete types
      if (error.code === 'ECONNRESET' && req.reusedSocket === true) {
        request(options, data)
          .then((result) => void resolve(result as ResultType))
          .catch(reject);
      } else {
        reject(error);
      }
    });

    req.on('aborted', () => {
      req.destroy();
      reject('Request aborted');
    });

    req.on('timeout', () => {
      req.destroy();
      reject('Request timed out');
    });

    if (dataStringified !== undefined) {
      req.write(dataStringified);
    }

    req.end();
  });
};

export { request };
