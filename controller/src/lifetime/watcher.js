import * as k8s from '@kubernetes/client-node';

class Watcher {

    #cancellationToken;
    
    #kubeConfig;
    #endpoint;
    #added;
    #modified;
    #removed;

    constructor(kubeConfig, endpoint, added, modified, removed) {

        this.#cancellationToken = null;

        this.#kubeConfig = kubeConfig;
        this.#endpoint = endpoint;
        this.#added = added;
        this.#modified = modified;
        this.#removed = removed;

    }

    async beginWatch() {

        console.log(`Starting watch for endpoint '${this.#endpoint}'...`);

        const watch = new k8s.Watch(this.#kubeConfig);

        this.#cancellationToken = await watch.watch(this.#endpoint, {}, (type, apiObj, watchObj) => {

            if (type === 'ADDED') {
                this.#added(apiObj);
            } else if (type === 'MODIFIED') {
                this.#modified(apiObj);
            } else if (type === 'DELETED') {
                this.#removed(apiObj);
            } else {
                console.error(`Encountered unknown event type while watching endpoint '${this.#endpoint}': ${type}`);
            }

        }, (err) => {

            this.#cancellationToken = null;
            console.error(`An error occurred while watching endpoint '${this.#endpoint}': ${err}`);

        });

    }

    endWatch() {

        if (this.#cancellationToken !== null) {
            this.#cancellationToken.abort();
        }

    }

    isWatching() {

        return this.#cancellationToken !== null;

    }

}

export { Watcher };