import { useState } from 'react';
import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';

const content = BusuContentSchema.parse(raw);

/** Busu di Beranda: diketuk → mengucapkan fakta/semangat acak dengan ekspresi berbeda. */
export function useBusuTap() {
  const [k, setK] = useState(-1);
  const next = () =>
    setK((prev) => {
      let n = Math.floor(Math.random() * content.tapLines.length);
      if (n === prev) n = (n + 1) % content.tapLines.length;
      return n;
    });
  return { line: k >= 0 ? content.tapLines[k]! : null, next };
}
