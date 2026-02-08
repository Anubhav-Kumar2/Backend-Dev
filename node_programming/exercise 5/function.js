export function timeoutExample() {
  setTimeout(() => {
    console.log("setTimeout callback");
  }, 0);
}

export function immediateExample() {
  setImmediate(() => {
    console.log("setImmediate callback");
  });
}

export function nextTickExample() {
  process.nextTick(() => {
    console.log("process.nextTick callback");
  });
}

export function promiseExample() {
  Promise.resolve().then(() => {
    console.log("Promise.then callback");
  });
}