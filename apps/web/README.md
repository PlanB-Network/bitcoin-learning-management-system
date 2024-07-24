To use in CI when building the container

```
"container": {
  "executor": "@nx-tools/nx-container:build",
  "dependsOn": ["build"],
  "defaultConfiguration": "local",
  "options": {
    "engine": "docker",
    "file": "apps/web/docker/Dockerfile",
    "metadata": {
      "images": [
        "sovereign-university-web",
        "ghcr.io/PlanB-Network/sovereign-university-web"
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
