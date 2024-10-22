# Inherit metadata from github action job
target "docker-metadata-action" {}

variable "NODE_VERSION" {
  default = "22.10.0-alpine3.20"
}

target "api" {
  inherits = ["docker-metadata-action"]
  dockerfile = "./apps/api/docker/Dockerfile"
  args = {
    NODE_VERSION = "${NODE_VERSION}"
  }
}

target "web" {
  inherits = ["docker-metadata-action"]
  dockerfile = "./apps/web/docker/Dockerfile"
  args = {
    NODE_VERSION = "${NODE_VERSION}"
  }
}
