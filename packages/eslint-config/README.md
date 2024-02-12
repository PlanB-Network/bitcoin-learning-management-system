NB:

```
"import/resolver": {
  "typescript": {
    "alwaysTryTypes": true,
    "project": [
      "tsconfig.json",
      "*/*/*/tsconfig.*?.json",
      "*/*/*/tsconfig.json",
      "*/*/tsconfig.*?.json",
      "*/*/tsconfig.json"
    ]
  },
  "node": {
    "extensions": [".js", ".jsx", ".ts", ".tsx"]
  }
}
```
