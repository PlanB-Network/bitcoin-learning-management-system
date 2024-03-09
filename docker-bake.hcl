# Inherit metadata from github action job
target "docker-metadata-action" {}

variable "NODE_VERSION" {
  default = "20.9.0-alpine"
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
