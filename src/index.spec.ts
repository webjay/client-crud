import { strict as assert } from 'assert';
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

  it('can reject', () => {
    return assert.rejects(
      get(
        { hostname: 'localhost', port: 8910, path: '/' },
      )
    );
  });

  it('can handle http/1', () => {
    return assert.doesNotReject(get(
      { hostname: 'api.mapbox.com', path: '/' },
    ));
  });

  it('can handle same server', () => {
    const options = { hostname: 'example.com', path: '/' };
    return Promise.all([
      assert.doesNotReject(get(options)),
      assert.doesNotReject(get(options)),
    ]);
  });
});
