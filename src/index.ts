import { connect as http2Connect, constants as http2Constants } from 'http2';
import { RequestOptions } from 'https';

type ObjectOrUndefined = Record<string, unknown> | undefined;

const {
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_USER_AGENT,
} = http2Constants;

const isJsonRe = /^application\/(?:.+\+|)json(?:;.+|)$/iu;

const requestOptions = (options: RequestOptions) => {
  return {
    headers: {
      [HTTP2_HEADER_USER_AGENT]: `Node${process.versions.node}/HTTP/2 client-crud`,
      [HTTP2_HEADER_CONTENT_TYPE]: 'application/json; charset=utf-8',
      ...options.headers,
    },
    ...options,
  };
};

const request = <ResultType>(
  options: RequestOptions,
  data?: ObjectOrUndefined
): Promise<ResultType> => {
  return new Promise((resolve, reject) => {
    const dataStringified = data !== undefined ? JSON.stringify(data) : undefined;

    const {
      headers,
      method = 'GET',
      host,
      hostname,
      path,
    } = requestOptions(options);

    if (
      (typeof hostname !== 'string' && typeof host !== 'string') ||
      typeof path !== 'string' ||
      headers === undefined
    ) {
      reject(new Error('Missing options'));

      return;
    }

    // HTTP/1 Connection specific headers are forbidden
    delete headers.Host;

    const urlHostname = hostname ?? host;

    if (typeof urlHostname !== 'string') {
      reject(new Error('Missing hostname or host'));

      return;
    }

    const client = http2Connect(`https://${urlHostname}`);
    client.on('error', reject);

    const headersToSend = {
      ...headers,
      [HTTP2_HEADER_METHOD]: method,
      [HTTP2_HEADER_PATH]: path,
    };

    const http2RequestOptions = {
      endStream: dataStringified === undefined,
    };

    const req = client.request(headersToSend, http2RequestOptions);

    req.on('error', reject);

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

    req.on('response', (responseHeaders) => {
      const statusCode = responseHeaders[HTTP2_HEADER_STATUS] as unknown as number;
      const contentType = responseHeaders[HTTP2_HEADER_CONTENT_TYPE] as unknown as string;

      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk as Buffer));

      req.on('end', () => {
        const body = Buffer.concat(chunks).toString();

        if (statusCode >= 400 || statusCode < 200) {
          reject(new Error(body));
        } else if (isJsonRe.test(contentType)) {
          resolve(JSON.parse(body) as ResultType);
        } else {
          resolve(body as unknown as ResultType);
        }

        client.close();
      });
    });

    req.end();
  });
};

const get = <ResultType>(
  options: RequestOptions,
): Promise<ResultType> => request(options);

const [post, put, patch, remove] = ['POST', 'PUT', 'PATCH', 'DELETE'].map(
  (method) =>
    <ResultType>(
      options: RequestOptions,
      data: ObjectOrUndefined
    ): Promise<ResultType> =>
      request({ ...options, method }, data)
);

export { get, post, put, patch, remove as delete };
