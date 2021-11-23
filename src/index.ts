import { connect, ConnectionOptions } from 'tls';
import { request as request1 } from './http1';
import { request as request2 } from './http2';
import { Options } from './types';

type RequestMethod = typeof request2 | typeof request1;

const ALPNProtocols = ['h2', 'http/1.1', 'http/1.0'];

const request = <ResultType>(options: Options, data?: unknown): Promise<ResultType> => {
  return new Promise<ResultType>((resolve, reject) => {
    const { hostname, host, port = 443 } = options;
    const servername = hostname ?? host;

    const optionsConnect = {
      ALPNProtocols,
      host: servername,
      port,
      servername,
    } as ConnectionOptions;

    const socket = connect(optionsConnect);
    socket.on('error', reject);

    const socketClose = () => {
      socket.destroy();
    };

    const sendRequest = (requestMethod: RequestMethod) => {
      void requestMethod<ResultType>(options, data).then(resolve).catch(reject).finally(socketClose);
    };

    socket.on('connect', () => {
      const { alpnProtocol } = socket;
      switch (alpnProtocol) {
        case 'h2':
          void sendRequest(request2);
          return;
        default:
          void sendRequest(request1);
          return;
      }
    });
  });
};

const get = <ResultType>(options: Options): Promise<ResultType> => request(options);

const [post, put, patch, remove] = ['POST', 'PUT', 'PATCH', 'DELETE'].map(
  (method) => <ResultType>(options: Options, data: unknown): Promise<ResultType> => request({ ...options, method }, data)
);

export { request, get, post, put, patch, remove as delete };
