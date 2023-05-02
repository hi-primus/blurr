# blurr

Blurr is a typescript library for processing data. It support multiple dataframe technologies via Optimus, which means that you can process data in the browser using pyodide/pandas or in a remote cluster using pandas, cudf, spark or dask.

## Try Blurr

Try Blurr in your browser [here](https://blurr-playground.vercel.app/) or [run it locally](#installing-local-example).

## Installation

```bash
npm install @hi-primus/blurr
```

## Installing Local Example

After cloning this repo:

```bash
npm install
npm run build
cd examples/code-playground
npm install
npm run dev
```

## Usage

```typescript
import { Blurr } from '@hi-primus/blurr';

const blurr = Blurr();

const df = blurr.createDataframe({
  id: [1, 2, 3],
  name: ['John', 'Mary', 'Mike'],
  age: [22, 33, 44]
});

const result = await df.cols.names();
```


