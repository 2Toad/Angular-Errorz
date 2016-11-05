# 2.0.0

## Improvements

* **Flood Control**: a new (optional) feature to prevent spamming of duplicate status codes.
* **Chaining**: `addHandler` and `addBatch` support function chaining.
* **Module**: refactored for readability/maintainability.

## Breaking Changes

* **`init(handlers, callback)`**: renamed to `addBatch(statuses, handler)`.
* **`handledErrorCodes()`**: renamed to `statusCodes()`
* **`onError(rejection)`**: renamed to `handle(rejection)`

# 1.1.0

## Improvements

* **init()**: rewritten to accept array of handlers and callback

# 1.0.1

## Improvements

* **Services**: Removed unused service reference to $rootScope

# 1.0.0

Initial release
