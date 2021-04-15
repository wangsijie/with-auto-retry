import withRetry from '../src/index';

describe('sync function', () => {
    test('normal', () => {
        const func = (message: any) => message;
        const newFunc = withRetry(func);
        expect(newFunc('test')).toBe('test');
    });
    test('retry 3 times and success', () => {
        let tryCount = 0;
        const func = () => {
            if (tryCount < 3) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func);
        const value = newFunc();
        expect(value).toBe(3);
    });
    test('retry 5 times and fail', () => {
        let tryCount = 0;
        const func = () => {
            if (tryCount < 5) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func);
        expect(newFunc).toThrow();
    });
    test('retry 3 times and fail(set retryTime = 2)', () => {
        let tryCount = 0;
        const func = () => {
            if (tryCount < 3) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func, { retryTime: 2 });
        expect(newFunc).toThrow();
    });
    test('retryPredicater', () => {
        let tryCount = 0;
        const func = () => {
            if (tryCount < 1) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func, {
            retryPredicater: (retryCount, e) => {
                expect(retryCount).toBe(1);
                expect(e.message).toBe('This is a random error.');
                return true;
            }
        });
        const value = newFunc();
        expect(value).toBe(1);
    });
    test('stop retring by retryPredicater', () => {
        let tryCount = 0;
        const func = () => {
            if (tryCount < 1) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func, {
            retryPredicater: (retryCount, e) => {
                expect(retryCount).toBe(1);
                expect(e.message).toBe('This is a random error.');
                return false;
            }
        });
        expect(newFunc).toThrow();
    });
});

describe('async funciton', () => {
    test('normal', async () => {
        const func = async (message: any) => message;
        const newFunc = withRetry(func);
        const value = await newFunc('test');
        expect(value).toBe('test');
    });
    test('need to retry 1 time', async () => {
        let tryCount = 0;
        const func = async () => {
            if (tryCount < 1) {
                tryCount++;
                throw new Error('This is a random error.');
            }
            return tryCount;
        };
        const newFunc = withRetry(func);
        const value = await newFunc();
        expect(value).toBe(1);
    });
});
