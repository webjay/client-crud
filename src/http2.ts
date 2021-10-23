import { connect as http2Connect, constants as http2Constants } from 'http2';
import { RequestOptions } from 'https';
import { handleResponse } from './lib';

const {
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_USER_AGENT,
} = http2Constants;

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
  data?: unknown
): Promise<ResultType> => {
  return new Promise<ResultType>((resolve, reject) => {
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

    // // HTTP/1 Connection specific headers are forbidden
    // delete headers.Host;

    const urlHostname = hostname ?? host;

    if (typeof urlHostname !== 'string') {
      reject(new Error('Missing hostname or host'));

      return;
    }

    const client = http2Connect(`https://${urlHostname}`)

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

      handleResponse<ResultType>(req, statusCode, contentType).then(resolve).catch(reject);

      req.on('end', () => {
        client.close();
      });
    });

    req.end();
  });
};

export { request };
