#!/bin/bash

# set to the correct cluster context and namespace
kubectl config use-context $CLUSTER_NAME
kubectl config set-context $CLUSTER_NAME --namespace=$NAMESPACE

# prep the yamls
cp interlex_tpl.yaml interlex.yaml
cp ingress_tpl.yaml ingress.yaml

# interlex service and deployment
sed -ie 's/{{TAG}}/'$CF_BUILD_ID'/i' interlex.yaml
sed -ie 's|{{REGISTRY}}|'$REGISTRY'|i' interlex.yaml
kubectl apply -f interlex.yaml

# ingress
sed -ie 's|{{DOMAIN}}|'$DOMAIN'|i' ingress.yaml
kubectl apply -f ingress.yaml

# cleanup
rm -rf interlex.yaml* ingress.yaml*
