import { test } from 'vitest';

test.todo(
  '10 hours later from 22:00 the evening before Sydney springs forward is 09:00',
);
test.todo(
  '10 hours later from 22:00 the evening before Sydney falls back is 07:00',
);
test.todo(
  '10 hours earlier from 09:00 the morning after Sydney springs forward is 22:00',
);
test.todo(
  '10 hours earlier from 07:00 the morning after Sydney falls back is 22:00',
);
test.todo(
  'a span from Sydney across a change in Sydney gives the right London time',
);
test.todo(
  'a span from Sydney across a change in London gives the right London time',
);
