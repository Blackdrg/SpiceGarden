# Image SHA Pinning Reference
# Replace ${IMAGE_TAG} with the exact SHA256 digest from your container registry.
# Example: ghcr.io/spicegarden/backend@sha256:abc123...
#
# To pin an image, replace the image field in each deployment with:
#   image: ghcr.io/spicegarden/<service>@sha256:<digest>
#
# Digests can be obtained with:
#   skopeo inspect docker://ghcr.io/spicegarden/<service>:<tag> --raw | jq -r '.Digest'
#   or via your CI pipeline after building and pushing images.
#
# Current image references requiring SHA pinning:
#
# Backend:          ghcr.io/spicegarden/backend:${IMAGE_TAG:-latest}
# Customer Web:     ghcr.io/spicegarden/customer-web:${IMAGE_TAG:-latest}
# Restaurant Dash:  ghcr.io/spicegarden/restaurant-dashboard:${IMAGE_TAG:-latest}
# Super Admin:      ghcr.io/spicegarden/super-admin:${IMAGE_TAG:-latest}
# Delivery Partner: ghcr.io/spicegarden/delivery-partner:${IMAGE_TAG:-latest}
# Postgres:         postgres:16-alpine
# Redis:            redis:7-alpine
# Mongo:            mongo:7
# Alpine (backup):  alpine:3.19