interface Configs {
    /** How many times to retry before throw exception, defaults to 5 */
    retryTime?: number;
    /** Invoke before retry, return false to stop retring. retryCount start with 1 */
    retryPredicater?: (retryCount: number, e: any) => boolean;
    /** Seconds to wait before retry, defaults to 0. Func should be async to use this feature */
    secondsBeforeRetry?: number;
}

const sleep = (seconds: number) => new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
});

/**
 * Creates a function that will automaticly retry serval times on fail.
 *
 * @param func The function to restrict.
 * @param configs
 * @return Returns the new restricted function.
 */
export default function withAutoRetry<T extends (...args: any) => any>(
    func: T,
    configs?: Configs,
): (...funcArgs: Parameters<T>) => ReturnType<T> {
    const finalConfigs = configs || {};
    const retryTime = finalConfigs.retryTime || 5;
    const secondsBeforeRetry = finalConfigs.secondsBeforeRetry || 0;
    const retryPredicater = finalConfigs.retryPredicater;
    let tryCount = 1;
    const newFunc = (...args: Parameters<T>) => {
        const handleError = (e: any) => {
            if (tryCount >= retryTime) {
                throw e;
            } else {
                if (typeof retryPredicater === 'function') {
                    if (!retryPredicater(tryCount, e)) {
                        throw e;
                    }
                }
                tryCount++;
                return newFunc(...args);
            }
        }
        try {
            const res: ReturnType<T> = func(...args);
            if (res && res.then && res.catch) {
                return res.catch((e: any) => {
                    if (secondsBeforeRetry) {
                        return sleep(secondsBeforeRetry).then(() => handleError(e));
                    }
                    return handleError(e);
                });
            }
            return res;
        } catch (e: any) {
            return handleError(e);
        }
    }
    return newFunc;
}
