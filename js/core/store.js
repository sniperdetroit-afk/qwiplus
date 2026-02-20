let listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
}

export function notify() {
  listeners.forEach(fn => fn());
}