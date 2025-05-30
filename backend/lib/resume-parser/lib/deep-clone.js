/**
 * Server side object deep clone util using JSON serialization.
 * Not efficient for large objects but good enough for most use cases.
 *
 * Client side can simply use structuredClone.
 */
export var deepClone = function (object) {
    return JSON.parse(JSON.stringify(object));
};
