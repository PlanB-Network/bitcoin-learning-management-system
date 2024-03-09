To use in CI when building the container

```
"container": {
  "executor": "@nx-tools/nx-container:build",
  "dependsOn": ["build"],
  "options": {
    "engine": "docker",
    "file": "apps/api/docker/Dockerfile",
    "push": false,
    "metadata": {
      "images": [
        "sovereign-university-api",
        "ghcr.io/decouvrebitcoin/sovereign-university-api"
      ],
      "load": true,
      "tags": [
        "type=schedule",
        "type=ref,event=branch",
        "type=ref,event=tag",
        "type=sha,prefix=sha-"
      ]
    }
  }
}
```
