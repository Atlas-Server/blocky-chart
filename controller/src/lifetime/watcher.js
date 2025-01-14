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

    #handleWatchResponse(type, apiObj, watchObj) {

        if (type === 'ADDED') {

            this.#added(apiObj);

        } else if (type === 'MODIFIED') {

            this.#modified(apiObj);

        } else if (type === 'DELETED') {

            this.#removed(apiObj);

        } else {

            console.error(`Encountered unimplemented event type '${type}' while watching endpoint '${this.#endpoint}'`);

        }

    }

    #handleWatchError(err) {

        console.error(`An error occurred while watching endpoint '${this.#endpoint}': ${err}`);

    }

    async beginWatch() {

        console.log(`Starting watch for endpoint '${this.#endpoint}'...`);

        const watch = new k8s.Watch(this.#kubeConfig);

        this.#cancellationToken = await watch.watch(this.#endpoint, {}, this.#handleWatchResponse.bind(this), this.#handleWatchError.bind(this));

    }

    endWatch() {

        if (this.#cancellationToken !== null) {
            this.#cancellationToken.abort();
        }

    }

    isWatching() {

        return !this.#cancellationToken.signal.aborted;

    }

}

export { Watcher };