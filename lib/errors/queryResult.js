'use strict';

var $npm = {
    os: require('os'),
    utils: require('../utils')
};

/**
 * @enum {number}
 * @alias errors.queryResultErrorCode
 * @readonly
 * @description
 * `queryResultErrorCode` enumerator, available from the {@link errors} namespace.
 *
 * Represents an integer code for each type of error supported by type {@link errors.QueryResultError}.
 *
 * @see {@link errors.QueryResultError}
 */
var queryResultErrorCode = {
    /** No data returned from the query. */
    noData: 0,

    /** No return data was expected. */
    notEmpty: 1,

    /** Multiple rows were not expected. */
    multiple: 2
};

Object.freeze(queryResultErrorCode);

var errorMessages = [
    {name: 'noData', message: 'No data returned from the query.'},
    {name: 'notEmpty', message: 'No return data was expected.'},
    {name: 'multiple', message: 'Multiple rows were not expected.'}
];

/**
 * @interface errors.QueryResultError
 * @augments external:Error
 * @description
 *
 * This error is specified as the rejection reason for all result-specific methods when the result doesn't match
 * the expectation, i.e. when a query result doesn't match its Query Result Mask - the value of {@link queryResult}.
 *
 * The error applies to the result from the following methods: {@link Database.none none},
 * {@link Database.one one}, {@link Database.oneOrNone oneOrNone} and {@link Database.many many}.
 *
 * Supported errors:
 *
 * - `No return data was expected.`, method {@link Database.none none}
 * - `No data returned from the query.`, methods {@link Database.one one} and {@link Database.many many}
 * - `Multiple rows were not expected.`, methods {@link Database.one one} and {@link Database.oneOrNone oneOrNone}
 *
 * Like any other error, this one is notified with through the global event {@link event:error error}.
 *
 * The type is available from the {@link errors} namespace.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `QueryResultError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {object} result
 * The original $[Result] object that was received.
 *
 * @property {number} received
 * Total number of rows received. It is simply the value of `result.rows.length`.
 *
 * @property {number} code
 * Error code - {@link errors.queryResultErrorCode queryResultErrorCode} value.
 *
 * @property {string} query
 * Query that was executed.
 *
 * Normally, it is the query already formatted with values, if there were any.
 * But if you are using initialization option `pgFormatting`, then the query string is before formatting.
 *
 * @property {} values
 * Values passed in as query parameters. Available only when initialization option `pgFormatting` is used.
 * Otherwise, the values are within the pre-formatted `query` string.
 *
 * @example
 *
 * var QueryResultError = pgp.errors.QueryResultError;
 * var qrec = pgp.errors.queryResultErrorCode;
 *
 * var options = {
 *
 *   // pg-promise initialization options...
 *
 *   error: (err, e) => {
 *       if (err instanceof QueryResultError) {
 *           // A query returned unexpected number of records, and thus rejected;
 *           
 *           // we can check the error code, if we want specifics:
 *           if(err.code === qrec.noData) {
 *               // expected some data, but received none;
 *           }
 *
 *           // If you write QueryResultError into the console,
 *           // you will get a nicely formatted output.
 *
 *           console.log(err);
 *           
 *           // See also: err, e.query, e.params, etc.
 *       }
 *   }
 * };
 *
 * @see
 * {@link queryResult}, {@link Database.none none}, {@link Database.one one},
 * {@link Database.oneOrNone oneOrNone}, {@link Database.many many}
 *
 */
function QueryResultError(code, result, query, values) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'QueryResultError';
    this.stack = temp.stack;
    this.message = errorMessages[code].message;
    this.code = code;
    this.result = result;
    this.query = query;
    this.values = values;
    this.received = result.rows.length;
}

QueryResultError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: QueryResultError,
        writable: true,
        configurable: true
    }
});

/**
 * @method errors.QueryResultError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryResultError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'QueryResultError {',
            gap1 + 'code: queryResultErrorCode.' + errorMessages[this.code].name,
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'received: ' + this.received,
            gap1 + 'query: ' + (typeof this.query === 'string' ? '"' + this.query + '"' : JSON.stringify(this.query))
        ];
    if (this.values !== undefined) {
        lines.push(gap1 + 'values: ' + JSON.stringify(this.values));
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

QueryResultError.prototype.inspect = function () {
    return this.toString();
};

module.exports = {
    QueryResultError: QueryResultError,
    queryResultErrorCode: queryResultErrorCode
};
