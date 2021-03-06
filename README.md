# with-auto-retry

[![npm version](https://img.shields.io/npm/v/with-auto-retry.svg?style=flat-square)](https://www.npmjs.org/package/with-auto-retry)
[![build](https://img.shields.io/github/workflow/status/wangsijie/with-auto-retry/units-test?style=flat-square)](https://github.com/wangsijie/with-auto-retry/actions/workflows/test.yml)

Creates a function that will automaticly retry serval times on fail. Support both sync and async functions.

example:

```js
import withAutoRetry from 'with-auto-retry';
// or js
// const withAutoRetry = require('with-auto-retry').default;

let tryCount = 0;
const func = () => {
    if (tryCount < 3) {
        tryCount++;
        throw new Error('This is a random error.');
    }
    return tryCount;
};
const newFunc = withAutoRetry(func);
const value = newFunc();
console.log(value); // value is 3 and no exeptions
```

usage:

```js
withAutoRetry(func);
// or customize
const configs = { retryTime: 3 };
withAutoRetry(func, configs);
```

configs are all optional:

```ts
interface Configs {
    /** How many times to retry before throw exception, defaults to 5 */
    retryTime?: number;
    /** Invoke before retry, return false to stop retring. retryCount start with 1 */
    retryPredicater?: (retryCount: number, e: any) => boolean;
    /** Seconds to wait before retry, defaults to 0. Func should be async to use this feature */
    secondsBeforeRetry?: number;
}
```