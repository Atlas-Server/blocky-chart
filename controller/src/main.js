import formatConsole from 'console-stamp';
import * as k8s from '@kubernetes/client-node';
import * as AsyncHelpers from './util/async-helpers.js';
import * as ControllerConfig from './config/controller-config.js';
import { Controller } from './controller.js';

async function createKubeConfig() {

    let kubeconfig = new k8s.KubeConfig();

    try {

        console.log("Loading KubeConfig...");
        kubeconfig.loadFromDefault();

    } catch (err) {

        console.error(`An error occurred loading the KubeConfig: ${err}`);
        throw err;

    }

    console.log("KubeConfig loaded successfully");
    return kubeconfig;

}

async function createControllerConfig() {

    const controllerConfigFilePath = process.env.CONTROLLER_CONFIG_FILE_PATH || '';

    let controllerConfig = {};

    try {

        console.log(`Loading Controller configuration from '${controllerConfigFilePath}'...`);
        controllerConfig = await ControllerConfig.loadFromFile(controllerConfigFilePath);

    } catch (err) {

        console.error(`An error occurred loading the Controller configuration: ${err}`);
        throw err;

    }

    console.log("Controller configuration loaded successfully");
    return controllerConfig;

}

async function main() {

    const controllerConfig = await AsyncHelpers.retry(createControllerConfig, 10000);

    const kubeConfig = await AsyncHelpers.retry(createKubeConfig, 60000);

    const controller = new Controller(controllerConfig, kubeConfig);

    await controller.start();

}

formatConsole(console, { format: ':date(yyyy/mm/dd HH:MM:ss) :label' });

await main();
