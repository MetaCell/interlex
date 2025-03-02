#!/bin/bash

# Set the correct cluster context and namespace
kubectl config use-context $CLUSTER_NAME
kubectl config set-context $CLUSTER_NAME --namespace=$NAMESPACE

# Prep the YAML files
cp interlex_tpl.yaml interlex.yaml
cp ingress_tpl.yaml ingress.yaml
cp allow-outbound_tpl.yaml allow-outbound.yaml  # Add this line

# Apply interlex service and deployment
sed -ie 's/{{TAG}}/'$CF_BUILD_ID'/i' interlex.yaml
sed -ie 's|{{REGISTRY}}|'$REGISTRY'|i' interlex.yaml
kubectl apply -f interlex.yaml

# Apply ingress
sed -ie 's|{{DOMAIN}}|'$DOMAIN'|i' ingress.yaml
kubectl apply -f ingress.yaml

# Apply network policy
kubectl apply -f allow-outbound.yaml  # New step to allow outbound traffic

# Cleanup
rm -rf interlex.yaml* ingress.yaml* allow-outbound.yaml*
