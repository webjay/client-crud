import { RequestOptions } from 'https';

export interface Options extends RequestOptions {
  returnBuffer?: boolean;
}
