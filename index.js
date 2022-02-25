'use strict';

const Got = require('got');
const Hoek = require('@hapi/hoek');

/**
 * Prettify error message
 * @param  {Number} errorCode   Error code
 * @param  {String} errorReason Error message
 * @param  {String} caller      Name of method or call that caused the error
 * @return {Error}              Throws prettified error
 */
function throwError({ errorCode, errorStatusCode, errorReason }) {
    const err = new Error(`${errorStatusCode} Reason "${errorReason}"`);

    err.statusCode = errorStatusCode;
    err.code = errorCode;
    throw err;
}

const got = Got.extend({
    responseType: 'json',
    handlers: [
        (options, next) => {
            const { token } = options.context;

            // Default to setting bearer token
            if (token && !options.headers.authorization) {
                options.headers.authorization = `Bearer ${token}`;
            }

            // Skip streams
            if (options.isStream) {
                return next(options);
            }

            return (async () => {
                try {
                    const response = await next(options);

                    return response;
                } catch (error) {
                    // Handle errors
                    const { response } = error;
                    let errorCode = 'ERR_UNSUPPORTED_PROTOCOL';
                    let errorStatusCode = 500;
                    let errorReason = 'Internal server error';

                    errorCode = Hoek.reach(error, 'code', {
                        default: errorCode
                    });
                    if (response) {
                        errorStatusCode = Hoek.reach(response, 'statusCode', {
                            default: errorStatusCode
                        });
                        errorReason = Hoek.reach(response, 'body.message', {
                            default: JSON.stringify(response.body)
                        });
                    }

                    return throwError({ errorCode, errorStatusCode, errorReason });
                }
            })();
        }
    ]
});

module.exports = got;
