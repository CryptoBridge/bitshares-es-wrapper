#!/bin/bash

# Login first as cryptobridge using
# docker login

PACKAGE="cryptobridge/bitshares-es-wrapper"
VERSION=$(grep version package.json | awk -F'"' '$0=$4')

echo docker build --no-cache -t $PACKAGE:latest .
echo docker push $PACKAGE:latest

echo
read -p "Also push version ${VERSION}? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo docker tag $PACKAGE:latest $PACKAGE:$VERSION
    echo docker push $PACKAGE:$VERSION
fi
