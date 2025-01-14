
function wait(delay = 10000) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function retry(func, delay, ...args) {

    try {

        const result = await func(...args);

        return result;

    } catch (err) {
        
        console.log(err);
        console.log(`Retrying in ${delay} milliseconds...`);

    }

    await wait(delay);

    return retry(func, delay);
    
}

export { wait, retry };