import { parentPort} from 'node:worker_threads';

let result = 0;

for (let i = 0; i < 1e1; i++) {
  result++;
}

// Send a message back to the parent.
parentPort.postMessage(result)