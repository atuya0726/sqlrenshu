import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';

worker({
  async init() {
    return PGlite.create('memory://');
  },
});
