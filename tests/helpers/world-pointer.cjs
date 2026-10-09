const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the whole production script. Only the DOM/event loop are replaced.
function worldPointerHarness() {
  const listeners = [], timers = [], classes = new Set();
  let renders = 0;
  const grid = {
    style: {transform: ''},
    classList: {add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name)},
    querySelector: selector => selector === '.world-cell' ? {getBoundingClientRect: () => ({width: 100, height: 50})} : null,
    getBoundingClientRect: () => ({width: 940})
  };
  const tile = {dataset: {action: 'worldTile', id: 'test-landmark'}, disabled: false};
  const target = {closest: selector => selector === '.world-grid' ? grid : selector === '[data-action]' ? tile : null};
  const context = vm.createContext({
    Game: {home: {x: 32, y: 32}, getWorldTile: () => ({id: 'test-landmark'}), landmarkVisible: () => true},
    selectedNode: 'previous',
    window: {matchMedia: () => ({matches: false, addEventListener() {}})},
    document: {
      addEventListener: (type, fn, options) => listeners.push({type, fn, capture: options === true || !!options?.capture}),
      querySelector: () => null
    },
    render: () => renders++,
    setTimeout: (fn, delay) => timers.push({fn, delay})
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../grid-world.js'), 'utf8'), context, {filename: 'grid-world.js'});
  function dispatch(type, values = {}) {
    const event = {target, button: 0, pointerId: 1, pointerType: 'touch', clientX: 200, clientY: 200,
      defaultPrevented: false, stopped: false,
      preventDefault() {this.defaultPrevented = true;},
      stopImmediatePropagation() {this.stopped = true;}, ...values};
    // Document capture listeners precede bubbling listeners even when registered last.
    for (const capture of [true, false]) for (const listener of listeners) {
      if (event.stopped) break;
      if (listener.type === type && listener.capture === capture) listener.fn(event);
    }
    return event;
  }
  return {dispatch, grid, timers, selected: () => context.selectedNode, renders: () => renders,
    center: () => JSON.parse(vm.runInContext('JSON.stringify(worldView)', context)),
    expireClickGuard: () => timers.splice(0).forEach(timer => timer.fn())};
}
module.exports = {worldPointerHarness};
