/* eslint-disable @typescript-eslint/no-explicit-any */
declare const self, importScripts, loadPyodide;

export const initializeWorker = () => {
  // TODO: import fetch, allow scriptURL?, handle Source objects
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js');

  let backendLoaded = false;

  function _mapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = value;
    }
    return obj;
  }

  async function initialize(options = {}) {
    if (!backendLoaded) {
      options = Object.assign(
        { indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/' },
        options
      );

      self.pyodide = await loadPyodide(options);

      await self.pyodide.loadPackage('micropip');
      self.micropip = self.pyodide.pyimport('micropip');

      await self.micropip.install(
        'https://test-files.pythonhosted.org/packages/93/6a/773d51cfcd64e2ae491c7d1fbeccdcffdd3ce3c34c9c31729f327d05c086/pyoptimus-0.1.4024-py3-none-any.whl'
      );
      self.pyodide.runPython(`
        from optimus import Optimus
        from io import BytesIO
        op = Optimus("pyodide")
        def run_method(method, kwargs):
            return method(**kwargs.to_py())
      `);

      backendLoaded = true;
    }
  }

  let initialization;

  addEventListener(
    'message',
    async (e) => {
      if (typeof e.data !== 'object' || !('type' in e.data)) {
        throw new Error('Invalid message');
      }

      if (e.data.type === 'init') {
        initialization = initialize(e.data.options);

        await initialization;

        self.postMessage({
          type: 'init',
          id: e.data.id,
        });
      } else if (e.data.type === 'load') {
        await initialization;

        if (!backendLoaded) {
          console.warn('Backend not loaded, loading with default options...');
          await initialize();
        }

        if (e.data.packages && e.data.packages.length > 0) {
          await self.pyodide.loadPackage(e.data.packages);
        }

        self.postMessage({
          type: 'load',
          id: e.data.id,
        });
      } else if (e.data.type === 'run') {
        await initialization;

        if (!backendLoaded) {
          console.warn('Backend not loaded, loading with default options...');
          await initialize();
        }

        let result = null;
        let error = null;

        try {
          if (e.data.code) {
            result = self.pyodide.runPython(e.data.code);
          } else {
            const runMethod = self.pyodide.globals.get('run_method');
            result = runMethod(e.data.method, e.data.kwargs);
          }

          try {
            result =
              typeof result?.toJs === 'function'
                ? result.toJs({ dict_converter: _mapToObject })
                : result;
          } catch (error) {
            console.warn('Error converting to JS', error);
          }
        } catch (err) {
          error = err.message;
        }

        try {
          self.postMessage({
            type: 'run',
            id: e.data.id,
            result,
            error,
          });
        } catch (err) {
          if (err.message.includes('could not be cloned')) {
            const source = {} as any;
            source.name = e.data.kwargs?.target;
            source._blurrMember = 'source';
            self.postMessage({
              type: 'run',
              id: e.data.id,
              result: source,
            });
          } else {
            self.postMessage({
              type: 'run',
              id: e.data.id,
              result: null,
              error: err.message,
            });
          }
        }
      }
    },
    false
  );
};
