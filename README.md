
# Welcome to Blurr-js 👋

![Version](https://img.shields.io/badge/version-1.0.2-blue.svg?cacheSeconds=2592000)

## Install

```bash
# install dependencies
$ npm install
```

## Usage

```bash
# Build
$ npm run build-tsc

# Launch server
$ npm run start
```
# How to use


## Install

```bash
# Using npm:
$ npm install @hi-primus/blurrjs
```

```javascript
const Blurr =  require("@hi-primus/blurrjs");
```
## Initialize
```javascript
const blurr = new Blurr({
    optimusAddress,
});
```
## Create Request
```javascript
const result = await blurr.request({
    operation: "createDataframe",
    dict: { test: ["Abc", "def", "ghi", "jkl"] },
});

const display = await blurr.request({
    operation: "display",
    source: result.updated,
});
```
### Result
```json
{
    "status": "ok",
    "code": [
        "result = d1.to_dict()"
    ],
    "result": {
        "dict": [
            [
                "Abc",
                "def",
                "ghi",
                "jkl"
            ]
        ]
    }
}
```

---
