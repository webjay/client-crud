# HTTP/2 CRUD client

HTTPS requests.

    npm i client-crud

# API

Methods:
- get
- post
- put
- patch
- delete

Method parameters:
- Request options similar to [https.request](https://nodejs.org/docs/latest-v14.x/api/https.html#https_https_request_options_callback).
- JSON to be sent _(optional)_.

# Example

    import { get } from 'client-crud';

    const options = {
      hostname: 'yzr7679ckh.execute-api.eu-west-1.amazonaws.com',
      path: '/test',
    };

    const data = await get(options);

## dev

    npm run

## Deploy

    npm run build
    npx tsc
    npm run deploy
