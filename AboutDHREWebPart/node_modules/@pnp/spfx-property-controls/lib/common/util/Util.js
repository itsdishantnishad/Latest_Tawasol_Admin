/**
 * Debounce function
 *
 * @param fnc Function to execute
 * @param time Time to wait until the function gets executed
 */
export const debounce = () => {
    let timeout;
    return (fnc, time) => {
        const functionCall = (...args) => fnc.apply(this, args); // eslint-disable-line @typescript-eslint/no-explicit-any
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
    };
};
//# sourceMappingURL=Util.js.map