#!/bin/bash

# Login first as cryptobridge using
# docker login

docker build -t cryptobridge/bitshares-es-wrapper:latest .
docker push cryptobridge/bitshares-es-wrapper:latest
