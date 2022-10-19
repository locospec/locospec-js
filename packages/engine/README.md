```js
locoFactory.init({
  locoPath: path.resolve(__dirname),
  resourcesPath: path.resolve(__dirname, `resources`),
  mixinsPath: path.resolve(__dirname, `mixins`),
  hooksPath: path.resolve(__dirname, `hooks/index.js`),
  validatorsPath: path.resolve(__dirname, `validators/index.js`),
  generatorsPath: path.resolve(__dirname, `generators/index.js`),
  resolvePayloadFnPath: path.resolve(__dirname, `functions/resolvePayload.js`),
  resolveUserFnPath: path.resolve(__dirname, `functions/resolveUser.js`),
  operator: operator,
});
```
