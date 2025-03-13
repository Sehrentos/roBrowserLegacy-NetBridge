import cluster from 'cluster';
import os from 'os';
import config from './config.js';
import { server } from './src/server.js';

// multi core mode
if (config.cluster) {
    const numSPUs = os.cpus().length;
    // spread processes on multiple cores
    if (cluster.isPrimary) {
        console.log(`Master process ${process.pid} is running ${config.environment}`);

        for (let i = 0; i < numSPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker process ${worker.process.pid} died. Restarting...`);
            cluster.fork();
        });
    } else {
        // start server
        server();
    }
} else {
    // single core mode
    console.log(`Process ${process.pid} is running ${config.environment}`);
    server();
}