// Polyfill for global object used by some Node.js libraries
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  window.global = window;
}

// Polyfill for process.nextTick
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = {
    env: { NODE_ENV: process.env.NODE_ENV },
    nextTick: function(fn) { setTimeout(fn, 0); }
  };
}

// Polyfill for Buffer
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.Buffer = {
    isBuffer: function() { return false; }
  };
}

// Create a mock EventEmitter class
class EventEmitter {
  constructor() {
    this._events = {};
  }

  on() { return this; }
  once() { return this; }
  emit() { return true; }
  addListener() { return this; }
  removeListener() { return this; }
  removeAllListeners() { return this; }
  listeners() { return []; }
  listenerCount() { return 0; }
}

// Add EventEmitter to global scope
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.EventEmitter = EventEmitter;

  // Mock the events module
  // @ts-ignore
  window.require = window.require || function(module) {
    if (module === 'events') {
      return { EventEmitter };
    }
    if (module === 'util') {
      return {
        debuglog: function() { return function() {}; },
        inspect: function(obj) { return String(obj); },
        inherits: function(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        },
        format: function(f) { return f; }
      };
    }
    throw new Error(`Cannot find module '${module}'`);
  };
}
