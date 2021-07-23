# request
[![Version][npm-image]][npm-url] ![Downloads][downloads-image] [![Build Status][status-image]][status-url] [![Open Issues][issues-image]][issues-url] ![License][license-image]

> Wrapper around [got pkg](https://github.com/sindresorhus/got) to define a simple interface for http requests

## Usage

```bash
npm install screwdriver-request
```

Example:
```javascript
const Hoek = require('@hapi/hoek');
const logger = require('logger');
const request = require('screwdriver-request');

async _addPrComment({ comment, prNum, scmUri }) {
    try {
        const pullRequestComment = await request({
            method: 'POST',
            url: `https://gitlab.com/v4/projects/${repoId}/merge_requests/${prNum}/notes`,
            json: {
                body: 'This is a comment'
            },
            context: {
                token: this.config.commentUserToken,
                caller: 'createPullRequestComment'
            },
            timeout: 15000
        });
        
        return {
            commentId: Hoek.reach(pullRequestComment, 'body.id'),
            createTime: Hoek.reach(pullRequestComment, 'body.created_at'),
            username: Hoek.reach(pullRequestComment, 'body.author.username')
        };
    } catch (err) {
            logger.error('Failed to addPRComment: ', err);

            return null;
        }
    }
}

```
## Testing

```bash
npm test
```

## License

Code licensed under the BSD 3-Clause license. See LICENSE file for terms.

[npm-image]: https://img.shields.io/npm/v/screwdriver-request.svg
[npm-url]: https://npmjs.org/package/screwdriver-request
[downloads-image]: https://img.shields.io/npm/dt/screwdriver-request.svg
[license-image]: https://img.shields.io/npm/l/screwdriver-request.svg
[issues-image]: https://img.shields.io/github/issues/screwdriver-cd/request.svg
[issues-url]: https://github.com/screwdriver-cd/request/issues
[status-image]: https://cd.screwdriver.cd/pipelines/7717/badge
[status-url]: https://cd.screwdriver.cd/pipelines/7717
