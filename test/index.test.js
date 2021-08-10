'use strict';

const { assert } = require('chai');
const mockery = require('mockery');
const nock = require('nock');
const sinon = require('sinon');

sinon.assert.expose(assert, { prefix: '' });

describe('index', function() {
    // Time not important. Only life important.
    this.timeout(5000);

    const token = 'thisisatoken';
    const prefixUrl = 'https://gitlab.com/api/v4';
    const route = 'projects/1';
    const result = { result: 'success' };
    let got;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        /* eslint-disable global-require */
        got = require('../index');
        /* eslint-enable global-require */
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.resetCache();
    });

    after(() => {
        mockery.disable();
    });

    describe('handler', () => {
        beforeEach(() => {
            nock.disableNetConnect();
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('sets token successfully', () => {
            nock(prefixUrl, {
                reqheaders: {
                    authorization: headerValue => headerValue.includes('Bearer ')
                }
            })
                .get(`/${route}`)
                .reply(200, result)
                .persist();

            return got({
                method: 'GET',
                url: `${prefixUrl}/${route}`,
                context: {
                    caller: '_getProject',
                    token
                }
            }).then(res => {
                assert.strictEqual(res.requestUrl, `${prefixUrl}/${route}`);
                assert.deepEqual(res.body, result);
            });
        });

        it('throws when get error code not in range', () => {
            nock(prefixUrl, {
                reqheaders: {
                    authorization: headerValue => headerValue.includes('Bearer ')
                }
            })
                .get(`/${route}`)
                .reply(500, {
                    message: 'Internal Server Error'
                })
                .persist();

            return got({
                method: 'GET',
                url: `${prefixUrl}/${route}`,
                context: {
                    token
                }
            })
                .then(() => {
                    assert.fail('should not get here');
                })
                .catch(error => {
                    assert.instanceOf(error, Error);
                    assert.match(error.message, '500 Reason "Internal Server Error"');
                    assert.match(error.statusCode, 500);
                });
        });
    });
});
