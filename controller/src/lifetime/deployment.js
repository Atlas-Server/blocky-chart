import * as k8s from '@kubernetes/client-node';

class Deployment {

    #kubeConfig;
    #name;
    #namespace;

    #k8sApi;
    
    constructor(kubeConfig, name, namespace) {

        this.#kubeConfig = kubeConfig;
        this.#name = name;
        this.#namespace = namespace;

        this.#k8sApi = kubeConfig.makeApiClient(k8s.AppsV1Api);

    }

    async rolloutRestart() {

        const date = new Date();

        const patch = [
            { op: "add", path: "/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt", value: date.toISOString() }
        ];

        const fallbackPatch = [
            { op: "add", path: "/spec/template/metadata/annotations", value: {} },
            { op: "add", path: "/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt", value: date.toISOString() },
        ];

        try {

            await this.#k8sApi.patchNamespacedDeployment({ name: this.#name, namespace: this.#namespace, body: patch, options: { headers: { 'content-type': 'application/json-patch+json' } } });

        } catch (err) {

            await this.#k8sApi.patchNamespacedDeployment({ name: this.#name, namespace: this.#namespace, body: fallbackPatch, options: { headers: { 'content-type': 'application/json-patch+json' } } });

        }

    }

}

export { Deployment };