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
function throwError({ errorCode, errorReason }) {
    const err = new Error(`${errorCode} Reason "${errorReason}"`);

    err.statusCode = errorCode;
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
                    let errorCode = 500;
                    let errorReason = 'Internal server error';

                    if (response) {
                        errorCode = Hoek.reach(response, 'statusCode', {
                            default: errorCode
                        });
                        errorReason = Hoek.reach(response, 'body.message', {
                            default: JSON.stringify(response.body)
                        });
                    }

                    return throwError({ errorCode, errorReason });
                }
            })();
        }
    ]
});

module.exports = got;
