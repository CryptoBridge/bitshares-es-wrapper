#!/usr/bin/env node

const request = require('superagent');
const express = require('express');

const server = express();

const esHost = process.env.ES_HOST || 'localhost';
const esPort = process.env.ES_PORT || 9200;
const esWrapperPort = process.env.ES_WRAPPER_PORT || 5000;

server.get('/get_account_history', (req, response) => {
    const {
        account_id, from, from_date, to_date // eslint-disable-line camelcase
    } = req.query;
    let { size } = req.query;

    if (size > 10000) {
        size = 10000;
    }

    const json = {
        sort: [{ 'block_data.block_time': { order: 'desc' } }],
        query: {
            bool: {
                must: [{ match: { 'account_history.account': account_id } },
                    { range: { 'block_data.block_time': { gte: from_date, lte: to_date } } }]
            }
        },
        from: from || 0,
        size: size || 100,
    };

    request
        .post(`http://${esHost}${esPort ? `:${esPort}` : ''}/_search`)
        .send(json)
        .set('accept', 'json')
        .end((err, res) => {
            if (err) {
                console.error(err); // eslint-disable-line no-console
                return response.status(err.status || 500).json(err);
            }

            if (!res.body || !res.body.hits || !res.body.hits.hits) {
                console.warn('Empty result'); // eslint-disable-line no-console
                return response.json([]);
            }
            if (res.body.hits.hits) {
                const results = [];

                res.body.hits.hits.map(item => results.push(item._source)); // eslint-disable-line no-underscore-dangle
                return response.json(results);
            }
            return response.json([]);
        });
});

server.listen(esWrapperPort, () => {
    console.log(`BitShares ES Wrapper is running on port ${esWrapperPort}`); // eslint-disable-line no-console
});
