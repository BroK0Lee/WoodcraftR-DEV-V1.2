/**
 * cadWorker.ts – Singleton de communication avec occ.worker.ts
 */

import type { CadIn, CadOut } from './cadTypes';
import { hashOperations } from '@/utils/hashOperations';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – Import d'un worker bundlé (Vite)
// prettier-ignore
const worker = new Worker(new URL('../workers/occ.worker.ts', import.meta.url), { type: 'module' });

const listeners: ((out: CadOut) => void)[] = [];

worker.addEventListener('message', (e: MessageEvent<CadOut>) => {
  const data = e.data;
  listeners.forEach((cb) => cb(data));
});

export function postCad(ops: CadIn['operations']): Promise<CadOut> {
  return new Promise(async (resolve) => {
    const version = await hashOperations(ops);

    const handle = (out: CadOut) => {
      if (out.version === version) {
        listeners.splice(listeners.indexOf(handle), 1);
        resolve(out);
      }
    };
    listeners.push(handle);

    const payload: CadIn = { operations: ops, version };
    worker.postMessage(payload);
  });
}
