#!/bin/bash

export CLUSTER_NAME=minikube
export NAMESPACE=interlex
export CF_BUILD_ID=latest
export REGISTRY=
export DOMAIN=interlex.local

source ./deploy.sh
