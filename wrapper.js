#!/usr/bin/env node

const request = require('superagent');
const express = require('express');

var server = express();

server.get( '/get_account_history', (req, response, next) => {

    var account_id= req.query.account_id;
    var gte = req.query.from_date;
    var lte = req.query.to_date;
    var sortby = req.query.sort_by;
    var size = req.query.size;

    if (size > 10000) {
        size = 10000;
    }

    const json = {
        "sort": [{"block_data.block_time": {"order": "desc"}}],
        "query": {"bool": {"must": [{"match": {"account_history.account":account_id}},
        {"range": {"block_data.block_time": {"gte": gte, "lte": lte}}}]}},
        "from": 0, "size": size
    };



    request
      .post('http://localhost:9200/_search')
      .send(json)
      .set('accept', 'json')
      .end((err, res) => {

          if (err) {
              console.error(err);
              return response.status(err.status || 500).json(err);
          }

          if (!res.body || !res.body.hits || !res.body.hits.hits ) {
              console.warn('Empty result');
              return response.json([]);
          }
          if (res.body.hits.hits) {
                var results = [];

                res.body.hits.hits.map((item) => {
                    results.push(item._source);
                });
                response.json(results);
          }
          else {
              response.json([]);
        }
      });
});

server.listen(5000, () => {
    console.log('BitShares ES Wrapper is running on port 5000');
});
