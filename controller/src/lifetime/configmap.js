import * as k8s from '@kubernetes/client-node';

class ConfigMap {

    #kubeConfig;
    #name;
    #namespace;

    #k8sApi;
    
    #body;
    
    constructor(kubeConfig, name, namespace) {

        this.#kubeConfig = kubeConfig;
        this.#name = name;
        this.#namespace = namespace;

        this.#k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);

    }

    async loadFromCluster() {

        const response = await this.#k8sApi.readNamespacedConfigMap({ name: this.#name, namespace: this.#namespace });

        this.#body = response;

    }

    getValue(key) {
            
        return this.#body.data[key];

    }

    writeValue(key, value) {

        this.#body.data[key] = value;

    }

    async writeToCluster() {
        
        await this.#k8sApi.replaceNamespacedConfigMap({ name: this.#name, namespace: this.#namespace, body: this.#body });

    }

}

export { ConfigMap };