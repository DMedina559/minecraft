export class RequestQueue {
  constructor(system, {
    concurrency = 2,
    maxWaiters = 64
  } = {}) {
    Object.assign(this, {
      system,
      concurrency,
      maxWaiters
    });
    this.active = new Map();
    this.waiters = [];
    this.cancelled = new Map();
  }
  cancellationKey(id, consumerId) {
    return `${consumerId}:${id}`;
  }
  expire() {
    for (const [key, until] of this.cancelled)
      if (until <= Date.now()) this.cancelled.delete(key)
  }
  acquire(id, deadline, consumerId = "anonymous") {
    this.expire();
    const key = this.cancellationKey(id, consumerId);
    if (!Number.isFinite(deadline) || deadline <= Date.now()) return Promise.reject(Error("BSM request deadline exceeded before dispatch"));
    if (this.cancelled.has(key)) return Promise.reject(Error("BSM request cancelled before dispatch"));
    if (this.active.has(key) || this.waiters.some(x => x.key === key)) return Promise.reject(Error("Duplicate BSM request ID"));
    if (this.active.size >= this.concurrency && this.waiters.length >= this.maxWaiters) return Promise.reject(Error("BSM request queue full"));
    return new Promise((resolve, reject) => {
      const state = {
        id,
        consumerId,
        key,
        deadline,
        resolve,
        reject,
        cancelled: false,
        dispatched: false,
        timer: null
      };
      state.guard = (dispatch = false) => {
        if (state.cancelled || state.deadline <= Date.now()) throw Error(`BSM request ${state.cancelled?"cancelled":"deadline exceeded"}${state.dispatched?" after dispatch; operation may have completed":" before dispatch"}`);
        if (dispatch) state.dispatched = true;
      };
      if (this.active.size < this.concurrency) {
        this.active.set(key, state);
        resolve(state)
      } else {
        state.timer = this.system.runTimeout(() => {
          this.waiters = this.waiters.filter(x => x !== state);
          reject(Error("BSM request queue deadline exceeded before dispatch"))
        }, Math.max(1, Math.ceil((deadline - Date.now()) / 50)));
        this.waiters.push(state);
      }
    });
  }
  release(state) {
    this.active.delete(state.key);
    while (this.waiters.length && this.active.size < this.concurrency) {
      const next = this.waiters.shift();
      this.system.clearRun(next.timer);
      try {
        next.guard();
        this.active.set(next.key, next);
        next.resolve(next)
      } catch (e) {
        next.reject(e)
      }
    }
  }
  cancel(id, consumerId = "anonymous") {
    const key = this.cancellationKey(id, consumerId);
    this.expire();
    if (this.cancelled.size >= 128) this.cancelled.delete(this.cancelled.keys().next().value);
    this.cancelled.set(key, Date.now() + 30000);
    const waiting = this.waiters.find(x => x.key === key);
    if (waiting) {
      this.waiters = this.waiters.filter(x => x !== waiting);
      this.system.clearRun(waiting.timer);
      waiting.cancelled = true;
      waiting.reject(Error("BSM request cancelled before dispatch"));
      return true;
    }
    const active = this.active.get(key);
    if (active) {
      active.cancelled = true;
      return !active.dispatched
    }
    return true;
  }
  status() {
    return {
      active: this.active.size,
      waiting: this.waiters.length
    };
  }
}
