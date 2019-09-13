#!/usr/bin/env node

const got = require('got');
const express = require('express');

const server = express();

const esProtocol = process.env.ES_PROTOCOL || 'http';
const esHost = process.env.ES_HOST || 'localhost';
const esPort = process.env.ES_PORT || 9200;
const esWrapperPort = process.env.ES_WRAPPER_PORT || 5000;

server.get('/get_account_history', (req, response, next) => {
    const {
        account_id, from, from_date, to_date // eslint-disable-line camelcase
    } = req.query;
    let { size } = req.query;

    if (!from_date || !to_date) { // eslint-disable-line camelcase
        const err = new Error('Invalid request');
        err.status = 400;
        return next(err);
    }

    if (size > 10000) {
        size = 10000;
    }

    const must = [{ range: { 'block_data.block_time': { gte: from_date, lte: to_date } } }];
    if (account_id) { // eslint-disable-line camelcase
        must.push({ match: { 'account_history.account': account_id } });
    }

    const body = {
        sort: [{ 'block_data.block_time': { order: 'desc' } }],
        query: { bool: { must } },
        from: from || 0,
        size: size || 100,
    };

    return got
        .post(`${esProtocol}://${esHost}${esPort ? `:${esPort}` : ''}/_searchhh`, { json: true, body })
        .then((res) => {
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
        })
        .catch(err => next(err))
});

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (typeof err === 'string') {
        err = new Error(err);
    }
    err.status = (err.response ? err.response.statusCode : err.status) || 500;
    err.payload = {
        status: err.status,
        stack: err.stack.split('\n'),
        headers: err.response ? err.response.headers : undefined,
        query: err.response ? err.response.query : undefined,
        body: err.response ? err.response.body : undefined,
        files: err.response ? err.response.files : undefined,
        exception: err.response ? err.response.error : undefined,
    };
    console.log(`Error ${req.method} ${req.originalUrl} (${err.status}): ${res.get('Content-Length') || 0} Bytes`, err.status !== 404 ? err.payload : ''); // eslint-disable-line no-console

    res.status(err.status).json({ message: err.message });
});

server.listen(esWrapperPort, () => {
    console.log(`BitShares ES Wrapper is running on port ${esWrapperPort}`); // eslint-disable-line no-console
});
