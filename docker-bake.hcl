# Inherit metadata from github action job
target "docker-metadata-action" {}

variable "NODE_VERSION" {
  default = "22.13.0-alpine3.20"
}

variable "GITHUB_SHA" {
  default = ""
}

target "base" {
  inherits = ["docker-metadata-action"]
  dockerfile = "./docker/Dockerfile.base"
}

target "api" {
  contexts = {
    blms-base = "target:base"
  }
  inherits = ["docker-metadata-action"]
  dockerfile = "./apps/api/docker/Dockerfile"
  args = {
    NODE_VERSION = "${NODE_VERSION}"
    GITHUB_SHA = "${GITHUB_SHA}"
  }
}

target "web" {
  contexts = {
    blms-base = "target:base"
  }
  inherits = ["docker-metadata-action"]
  dockerfile = "./apps/web/docker/Dockerfile"
  args = {
    NODE_VERSION = "${NODE_VERSION}"
    GITHUB_SHA = "${GITHUB_SHA}"
  }
}
