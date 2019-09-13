#!/bin/bash

# Login first as cryptobridge using
# docker login

PACKAGE="cryptobridge/bitshares-es-wrapper"
VERSION=$(grep version package.json | awk -F'"' '$0=$4')

docker build --no-cache -t $PACKAGE:latest .
docker push $PACKAGE:latest

echo
read -p "Also push version ${VERSION}? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    docker tag $PACKAGE:latest $PACKAGE:$VERSION
    docker push $PACKAGE:$VERSION
fi
