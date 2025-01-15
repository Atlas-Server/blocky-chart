import createExpressApp from 'express';
import * as AsyncHelpers from './util/async-helpers.js';
import * as BlockyConfig from './config/blocky-config.js';
import { ConfigMap } from './lifetime/configmap.js';
import { Deployment } from './lifetime/deployment.js';
import { Watcher } from './lifetime/watcher.js'

class Controller {

    #controllerConfig;
    #kubeConfig;

    #expressApp;

    #blockyConfigMap;
    #blockyDeployment;
    #dnsMappingsWatcher;

    #isDirty = false;
    #dnsMappings = {};


    constructor(controllerConfig, kubeConfig) {

        this.#controllerConfig = controllerConfig;
        this.#kubeConfig = kubeConfig;

        this.#blockyConfigMap = new ConfigMap(kubeConfig, this.#controllerConfig.blocky.configMapName, this.#controllerConfig.blocky.namespace);
        this.#blockyDeployment = new Deployment(kubeConfig, this.#controllerConfig.blocky.deploymentName, this.#controllerConfig.blocky.namespace);
        this.#dnsMappingsWatcher = new Watcher(kubeConfig, "/apis/blocky.io/v1/dnsmappings/", this.#onAddDnsMapping.bind(this), this.#onUpdateDnsMapping.bind(this), this.#onDeleteDnsMapping.bind(this));

    }
    
    #onAddDnsMapping(apiObj) {

        const name = apiObj.metadata.name;
        const domain = apiObj.spec.domain;
        const ipAddress = apiObj.spec.ipAddress;

        this.#dnsMappings[name] = { domain: domain, ipAddress: ipAddress };
        this.#isDirty = true;

        console.log(`Received new DNS mapping '${name}' { domain: ${domain}, ipAddress: ${ipAddress} }`);

    }

    #onUpdateDnsMapping(apiObj) {

        const name = apiObj.metadata.name;
        const domain = apiObj.spec.domain;
        const ipAddress = apiObj.spec.ipAddress;

        this.#dnsMappings[name] = { domain: domain, ipAddress: ipAddress };
        this.#isDirty = true;

        console.log(`Received update for DNS mapping '${name}' { domain: ${domain}, ipAddress: ${ipAddress} }`);

    }

    #onDeleteDnsMapping(apiObj) {

        const name = apiObj.metadata.name;

        delete this.#dnsMappings[name];
        this.#isDirty = true;

        console.log(`Received deletion for DNS mapping '${name}'`);

    }
    
    #statusEndpoint(req, res) {

        if (this.#controllerConfig.controller.watchDNSMappings && !this.#dnsMappingsWatcher.isWatching()) {

            res.status(500);
            res.send("DNS mappings watcher is not running");
            return;

        }

        res.send('RUNNING');
        res.status(200);
    }

    async #startWatchers() {

        if (this.#controllerConfig.controller.watchDNSMappings) {

            await this.#dnsMappingsWatcher.beginWatch();

        }

        console.log("Controller started");

        await this.#updateCycle();

    }

    async #updateCycle() {

        if (this.#controllerConfig.controller.watchDNSMappings && !this.#dnsMappingsWatcher.isWatching()) {

            console.log("Restarting DNS mappings watcher...");
            await AsyncHelpers.retry(this.#dnsMappingsWatcher.beginWatch.bind(this.#dnsMappingsWatcher), this.#controllerConfig.controller.retryInterval);

        }

        if (this.#isDirty) {
    
            try {

                await this.#blockyConfigMap.loadFromCluster();
    
                let blockyConfigValue = this.#blockyConfigMap.getValue('config.yml');

                let blockyConfig = BlockyConfig.parseAndValidate(blockyConfigValue);

                if (this.#controllerConfig.controller.watchDNSMappings) {
        
                    blockyConfig.customDNS.mapping = {};
    
                    for (const [key, value] of Object.entries(this.#dnsMappings)) {
        
                        blockyConfig.customDNS.mapping[value.domain] = value.ipAddress;
        
                    }
        
                }
        
                blockyConfigValue = BlockyConfig.stringifyAndValidate(blockyConfig);
    
                this.#blockyConfigMap.writeValue('config.yml', blockyConfigValue);
    
                await this.#blockyConfigMap.writeToCluster();

                await this.#blockyDeployment.rolloutRestart();

                this.#isDirty = false;
        
                console.log("Wrote Blocky configuration");

            } catch (err) {

                console.error(`An error occurred while updating Blocky configuration: ${err}`);

            }
    
        }
    
        await AsyncHelpers.wait(this.#controllerConfig.controller.updateInterval);
    
        return this.#updateCycle(this.#controllerConfig);
    
    }

    async start() {

        console.log("Starting Controller...");

        this.#expressApp = createExpressApp();

        this.#expressApp.get('/status', this.#statusEndpoint.bind(this));

        this.#expressApp.listen(3000, this.#startWatchers.bind(this));

    }

}

export { Controller };