import assert from 'assert';
import { get, post } from '.';
// @ts-ignore
import { get as getFromDist } from '../dist';

interface IPostmanResponse {
  args: Record<string, unknown>;
  data: Record<string, unknown>;
  files: Record<string, unknown>;
  form: Record<string, unknown>;
  headers: Record<string, unknown>;
  json: Record<string, unknown>;
  url: string;
}

const hostnameTest = 'yzr7679ckh.execute-api.eu-west-1.amazonaws.com';

describe('client-crud', () => {
  it('get is a method', () => {
    assert.strictEqual(typeof get, 'function');
  });

  // making sure esbuild works
  it('distributed get is a method', () => {
    assert.strictEqual(typeof getFromDist, 'function');
  });

  it('can get from postman-echo.com', async () => {
    const data = await get<IPostmanResponse>(
      { hostname: 'postman-echo.com', path: '/get' },
    );

    assert.ok(data.url);
  });

  it('can post to postman-echo.com', async () => {
    const data = await post<IPostmanResponse>(
      { hostname: 'postman-echo.com', path: '/post' },
      { test: true }
    );

    assert.strictEqual(data.json.test, true);
  });

  xit('can get from AWS API Gateway', () => {
    return get(
      { host: hostnameTest, path: '/test/pets' },
    );
  });

  xit('can post to AWS API Gateway', () => {
    return post(
      {
        hostname: hostnameTest,
        path: '/test/pets',
      },
      {
        type: 'Utahraptor',
        price: 1,
      }
    );
  });

  it('can reject', () => {
    return assert.rejects(
      get(
        { hostname: 'localhost', port: 8910, path: '/' },
      )
    );
  });
});
