import Ajv from 'ajv';
import { parse as parseYaml, stringify as stringifyYaml }  from 'yaml';

const BLOCKY_CONFIG_SCHEMA = {
    type: 'object',
    properties: {
        upstreams: {
            type: 'object',
            properties: {
                init: {
                    type: 'object',
                    properties: {
                        strategy: {
                            type: 'string',
                            pattern: '^blocking|failOnError|fast$'
                        }
                    },
                    additionalProperties: false
                },
                groups: {
                    type: 'object',
                    additionalProperties: true
                },
                strategy: {
                    type: 'string',
                    pattern: '^parallel_best|strict|random$'
                },
                timeout: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                userAgent: {
                    type: 'string'
                }
            },
            additionalProperties: false
        },
        connectIPVersion: {
            type: 'string',
            pattern: '^dual|v4|v6$'
        },
        customDNS: {
            type: 'object',
            properties: {
                customTTL: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                filterUnmappedTypes: {
                    type: 'boolean'
                },
                rewrite: {
                    type: 'object',
                    additionalProperties: true
                },
                mapping: {
                    type: 'object',
                    additionalProperties: true
                }
            },
            additionalProperties: false
        },
        conditional: {
            type: 'object',
            properties: {
                fallbackUpstream: {
                    type: 'boolean',
                },
                rewrite: {
                    type: 'object',
                    additionalProperties: true
                },
                mapping: {
                    type: 'object',
                    additionalProperties: true
                }
            },
            additionalProperties: false
        },
        blocking: {
            type: 'object',
            properties: {
                denylists: {
                    type: 'object',
                    additionalProperties: true
                },
                allowlists: {
                    type: 'object',
                    additionalProperties: true
                },
                clientGroupsBlock: {
                    type: 'object',
                    additionalProperties: true
                },
                blockType: {
                    type: 'string',
                    pattern: '^(?:(?:(?:25[0-5]|(?:2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}|(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))|zeroIp|nxDomain|,|, )+$'
                },
                blockTTL: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                loading: {
                    type: 'object',
                    properties: {
                        refreshPeriod: {
                            type: 'string',
                            pattern: '^[0-9]+(ms|s|m|h)$'
                        },
                        downloads: {
                            type: 'object',
                            properties: {
                                timeout: {
                                    type: 'string',
                                    pattern: '^[0-9]+(ms|s|m|h)$'
                                },
                                attempts: {
                                    type: 'number',
                                    minimum: 1
                                },
                                cooldown: {
                                    type: 'string',
                                    pattern: '^[0-9]+(ms|s|m|h)$'
                                }
                            },
                            additionalProperties: false
                        },
                        concurrency: {
                            type: 'number',
                            minimum: 1
                        },
                        strategy: {
                            type: 'string',
                            pattern: '^blocking|failOnError|fast$'
                        },
                        maxErrorsPerSource: {
                            type: 'number',
                            minimum: -1
                        }
                    },
                    additionalProperties: false
                }
            },
            additionalProperties: false
        },
        caching: {
            type: 'object',
            properties: {
                minTime: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                maxTime: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                maxItemsCount: {
                    type: 'number',
                    minimum: 0
                },
                prefetching: {
                    type: 'boolean'
                },
                prefetchExpires: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                prefetchThreshold: {
                    type: 'number',
                    minimum: 0
                },
                prefetchMaxItemsCount: {
                    type: 'number',
                    minimum: 0
                },
                cacheTimeNegative: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                }
            },
            additionalProperties: false
        },
        clientLookup: {
            type: 'object',
            properties: {
                upstream: {
                    type: 'string',
                    pattern: "^(?:(?:25[0-5]|(?:2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}|(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$"
                },
                singleNameOrder: {
                    type: 'array',
                    items: {
                        type: 'number',
                        minimum: 1
                    }
                },
                clients: {
                    type: 'object',
                    additionalProperties: true
                }
            },
            additionalProperties: false
        },
        prometheus: {
            type: 'object',
            properties: {
                enable: {
                    type: 'boolean'
                },
                path: {
                    type: 'string'
                }
            },
            additionalProperties: false
        },
        queryLog: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    pattern: '^mysql|postgresql|csv|csv-client$'
                },
                target: {
                    type: 'string'
                },
                logRetentionDays: {
                    type: 'number',
                    minimum: 1
                },
                creationAttempts: {
                    type: 'number',
                    minimum: 1
                },
                creationCooldown: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                fields: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                flushInterval: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                }
            },
            additionalProperties: false
        },
        redis: {
            type: 'object',
            properties: {
                address: {
                    type: 'string'
                },
                username: {
                    type: 'string'
                },
                password: {
                    type: 'string'
                },
                database: {
                    type: 'number',
                    minimum: 0
                },
                required: {
                    type: 'boolean'
                },
                connectionAttempts: {
                    type: 'number',
                    minimum: 1
                },
                connectionCooldown: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                sentinelUsername: {
                    type: 'string'
                },
                sentinelPassword: {
                    type: 'string'
                },
                sentinelAddresses: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            },
            additionalProperties: false
        },
        minTlsServeVersion: {
            type: 'string'
        },
        bootstrapDns: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        filtering: {
            type: 'object',
            properties: {
                queryTypes: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            },
            additionalProperties: false
        },
        hostsFiles: {
            type: 'object',
            properties: {
                sources: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                },
                hostsTTL: {
                    type: 'string',
                    pattern: '^[0-9]+(ms|s|m|h)$'
                },
                filterLoopback: {
                    type: 'boolean'
                },
                loading: {
                    type: 'object',
                    properties: {
                        refreshPeriod: {
                            type: 'string',
                            pattern: '^[0-9]+(ms|s|m|h)$'
                        },
                        downloads: {
                            type: 'object',
                            properties: {
                                timeout: {
                                    type: 'string',
                                    pattern: '^[0-9]+(ms|s|m|h)$'
                                },
                                attempts: {
                                    type: 'number',
                                    minimum: 1
                                },
                                cooldown: {
                                    type: 'string',
                                    pattern: '^[0-9]+(ms|s|m|h)$'
                                }
                            },
                            additionalProperties: false
                        },
                        concurrency: {
                            type: 'number',
                            minimum: 1
                        },
                        strategy: {
                            type: 'string',
                            pattern: '^blocking|failOnError|fast$'
                        },
                        maxErrorsPerSource: {
                            type: 'number',
                            minimum: -1
                        }
                    },
                    additionalProperties: false
                }
            },
            additionalProperties: false
        },
        ports: {
            type: 'object',
            properties: {
                dns: {
                    type: 'number',
                    minimum: 1,
                    maximum: 65535
                },
                tls: {
                    type: 'number',
                    minimum: 1,
                    maximum: 65535
                },
                https: {
                    type: 'number',
                    minimum: 1,
                    maximum: 65535
                },
                http: {
                    type: 'number',
                    minimum: 1,
                    maximum: 65535
                }
            },
            additionalProperties: false
        },
        log: {
            type: 'object',
            properties: {
                level: {
                    type: 'string',
                    pattern: '^trace|debug|info|warn|error$'
                },
                format: {
                    type: 'string',
                    pattern: '^json|text$'
                },
                timestamp: {
                    type: 'boolean'
                },
                privacy: {
                    type: 'boolean'
                }
            },
            additionalProperties: false
        },
        ede: {
            type: 'object',
            properties: {
                enable: {
                    type: 'boolean'
                }
            },
            additionalProperties: false
        },
        specialUseDomains: {
            type: 'object',
            additionalProperties: true
        },
        ecs: {
            type: 'object',
            properties: {
                useAsClient: {
                    type: 'boolean'
                },
                forward: {
                    type: 'boolean'
                }
            },
            additionalProperties: false
        }
    }
};

function parseAndValidate(config) {

    let parsedConfigObject = parseYaml(config);

    const ajv = new Ajv();
    const validator = ajv.compile(BLOCKY_CONFIG_SCHEMA);

    if (!validator(parsedConfigObject)) {

        const errors = JSON.stringify(validator.errors, null, 2);
        throw new Error(errors);

    }

    return parsedConfigObject;

}

function stringifyAndValidate(configObject) {

    const ajv = new Ajv();
    const validator = ajv.compile(BLOCKY_CONFIG_SCHEMA);

    if (!validator(configObject)) {

        const errors = JSON.stringify(validator.errors, null, 2);
        throw new Error(errors);

    }

    let stringifiedConfig = stringifyYaml(configObject);

    return stringifiedConfig;

}

export { parseAndValidate, stringifyAndValidate };