type SendFn<T> = (payload: T[]) => Promise<void>;

interface BatchQueueOptions<T> {
  batchSize: number;
  flushInterval: number;
  flushOnEnqueue?: boolean;
  send: SendFn<T>;
}

export class BatchQueue<T> {
  private queue: T[] = [];
  private isFlushing = false;
  private timer: Timer;
  private flushOnEnqueue: boolean = true;

  constructor(private options: BatchQueueOptions<T>) {
    this.flushOnEnqueue = options.flushOnEnqueue ?? true;
    this.timer = setInterval(() => this.flush(), options.flushInterval);
  }

  enqueue(item: T) {
    this.queue.push(item);

    if (this.flushOnEnqueue && this.queue.length >= this.options.batchSize) {
      void this.flush();
    }
  }

  getLength() {
    return this.queue.length;
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;

    const batch = this.queue.splice(0, this.options.batchSize);

    try {
      await this.options.send(batch);
    } catch (err) {
      // Requeue on failure (preserves order)
      this.queue.unshift(...batch);
      throw err;
    } finally {
      this.isFlushing = false;
    }
  }

  destroy() {
    clearInterval(this.timer);
  }
}
