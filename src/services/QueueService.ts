import GenericQueue from "../GenericQueue";
import { StudentData, ScreenerInfo } from "../types/Queue";
import startQueueCleanup from "../jobs/cleanup";

type D = StudentData;
type S = ScreenerInfo;

class QueueService {
  queues: GenericQueue<D, S>[];
  redisUrl: string;

  initialize(redisUrl: string) {
    this.queues = [];
    this.redisUrl = redisUrl;
    return this;
  }

  addQueue<A extends D, B extends S>(key: string) {
    if (!this.redisUrl) {
      throw new Error("No redis url found");
    }
    const studentQueue = new GenericQueue<A, B>(key, this.redisUrl);
    startQueueCleanup(studentQueue);
    this.queues.push(studentQueue);
  }

  getQueue(key: string) {
    const queue = this.queues.find((q) => q.key === key);
    return queue;
  }
}

const service = new QueueService();
export default service;
