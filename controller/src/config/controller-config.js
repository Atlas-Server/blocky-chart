import { parse as parseYaml }  from 'yaml';
import Ajv from 'ajv';
import * as fs from 'node:fs/promises';

const CONTROLLER_CONFIG_SCHEMA = {
    type: 'object',
    properties: {
        blocky: {
            type: 'object',
            properties: {
                configMapName: { 
                    type: 'string'
                },
                configMapNamespace: { 
                    type: 'string'
                },
            },
            required: ["configMapName", "configMapNamespace"],
            additionalProperties: false
        },
        controller: {
            type: 'object',
            properties: {
                watchDNSMappings: {
                    type: 'boolean'
                },
                updateInterval: {
                    type: 'number'
                },
                retryInterval: {
                    type: 'number'
                }
            },
            required: ["watchDNSMappings", "updateInterval", "retryInterval"],
            additionalProperties: false
        }
    },
    required: ["blocky", "controller"],
    additionalProperties: false
};

async function loadFromFile(filePath = '') {

    if (filePath === '') {
        filePath = '/controller/config.yaml';
    }

    let rawConfig = "";
    let parsedConfigObject = { };
    
    rawConfig = await fs.readFile(filePath, 'utf8');
    
    parsedConfigObject = parseYaml(rawConfig);
    
    const ajv = new Ajv();
    const validator = ajv.compile(CONTROLLER_CONFIG_SCHEMA);

    if (!validator(parsedConfigObject)) {

        const errors = JSON.stringify(validator.errors, null, 2);
        throw new Error(errors);

    }

    return parsedConfigObject;

}

export { loadFromFile };