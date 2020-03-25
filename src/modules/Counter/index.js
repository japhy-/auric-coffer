import { useMemo } from 'react';

let prefix = 'counter';
let counter = 0;

export default function useNextId () {
  return useMemo(() => `${prefix}-${++counter}`, [prefix]);
}

export function setPrefix (pre) {
  prefix = pre;
}