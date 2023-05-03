<template>
  <NuxtLayout>
    <div
      class="playground-container text-sm md:text-md min-h-[50vh] p-1 md:p-3 lg:p-5 flex flex-wrap gap-[0.5rem] text-text"
      :class="{
        'pointer-events-none': !enabled
      }"
    >
      <div class="flex-[2] w-[640px] max-w-full">
        <div class="h-12 flex items-center mb-4">
          <button
            type="button"
            @click="runCode"
            class="bg-primary hover:bg-primary-darker flex items-center text-white rounded px-4 py-2 h-8"
          >
            Run
          </button>
          <div class="hints py-2 px-6">
            Client variable name:
            <span class="font-mono text-primary-darkest">blurr</span>
          </div>
        </div>

        <div
          @keydown.enter="
            e => {
              e.shiftKey && runCode();
              e.shiftKey && e.preventDefault();
              e.shiftKey && e.stopPropagation();
            }
          "
          ref="container"
          class="font-mono text-text-alpha rounded overflow-hidden h-[calc(100%-64px)] w-full"
        ></div>
      </div>
      <div class="result bg-white flex-1 min-w-[320px] max-w-full">
        <div class="title text-xl lg:text-2xl font-bold h-12 mb-6">Result</div>
        <div
          :class="{ 'text-error': error, 'text-primary-darkest': !error }"
          class="text-[14px] font-mono h-[calc(100%-64px)] overflow-auto whitespace-pre-wrap"
        >
          {{ result }}
        </div>
      </div>
    </div>
    <div
      v-if="!enabled"
      class="absolute inset-0 bg-white/75 flex gap-2 flex-col justify-center items-center"
    >
      <span class="loader text-primary"></span>
      <span class="text-text-light text-lg">Loading pyodide</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const monaco = useMonaco();
const blurrPackage = useBlurr();

const container = ref<HTMLElement | null>(null);

const enabled = ref(false);
// const code = ref(`
// url = "https://raw.githubusercontent.com/hi-primus/optimus/develop/examples/data/foo.csv";

// df = blurr.readFile({ url });

// return await df.cols.names();
// `);
const code = ref(`
df = blurr.createDataframe({
  name: ["john doe", "foo bar"],
  age: [20, -1],
  city: ["new york", null],
  country: ["usa", null]
});

df = df.cols.upper(["city"])

return await df.ascii();
`);
const result = ref('');
const error = ref(false);

async function runCode() {
  const AsyncFunction = eval('(async function() { return true }).constructor');

  try {
    error.value = false;
    result.value = await AsyncFunction(code.value)();
    //
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      error.value = true;
      result.value = err.message;
    }
  }

  return false;
}

const initializeEditor = () => {
  if (container.value) {
    const editor = monaco.editor.create(container.value, {
      value: code.value,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false
      }
    });

    editor.onDidChangeModelContent(() => {
      code.value = editor.getValue();
    });

    (window as any).editor = editor;

    // editor.getModel().tokenization.setLanguageId('javascript');
  }

  (window as any).monaco = monaco;
};

onMounted(() => {
  // monaco

  initializeEditor();

  if ((window as any).blurrDone) {
    enabled.value = true;
    return;
  }

  const { Blurr } = blurrPackage;

  const blurr = Blurr({
    serverOptions: {
      scriptURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js',
      useWorker: true
    }
  });
  blurr.runCode(`1+1`).then((result: string) => {
    console.info('Initialization result should be 2:', result);
    enabled.value = true;
  });
  (window as any).blurrPackage = blurrPackage;
  (window as any).blurr = blurr; // overrides window.blurr from package
  (window as any).blurrDone = true; // overrides window.blurr from package

  runCode();
});
</script>

<style lang="scss">
.loader {
  width: 36px;
  height: 36px;
  border: 4px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
