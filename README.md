> # Archived Repository 🚨
> **This project is no longer maintained and has been archived. No further issues, PRs, or updates will be made.**
---

# Angular-Errorz
[![GitHub version](https://badge.fury.io/gh/2Toad%2FAngular-Errorz.svg)](https://badge.fury.io/gh/2Toad%2FAngular-Errorz)

An error handling service for AngularJS

---

## Features

* Unique handling of each HTTP status code
* Batch handling of HTTP status codes
* Prevents handled errors from bubbling up (no unexpected errors in dependencies -- like promises)
* Configurable flood control to prevent spamming of duplicate errors

## Quick Start

> AngularJS ~1.2 is required

### Installation

`npm install angular-errorz`

#### Add module reference

```js
var exampleApp = angular.module("exampleApp", ["ttErrorz"]);
```

### Configuration

Configure the service within your app module's run block:

```js
exampleApp.run(["errorz", function (errorz) {
    errorz.addHandler(/* see Examples */);
}]);
```

## Functions

### `addHandler(status, handler)`
Add a handler for an HTTP status code

#### Arguments
| Param   | Type     | Details                                                                            |
|---------|----------|------------------------------------------------------------------------------------|
| status  | Number   | The HTTP status code to handle.                                                    |
| handler | Function | The function the service should call when handling the specified HTTP `status` code. |

#### Returns
`errorz`:  for chaining.

### `addBatch(statuses, handler)`
Add a handler for multiple HTTP status codes

#### Arguments
| Name     | Type     | Details                                                                               |
|----------|----------|---------------------------------------------------------------------------------------|
| statuses | Array    | The HTTP status codes to handle.                                                      |
| handler  | Function | The function the service should call when handling the specified HTTP `status` codes. |

#### Returns
`errorz`: for chaining.

### `handled(status)`
Determines whether the service has been configured to handle the specified `status`

#### Arguments
| Param  | Type   | Details                        |
|--------|--------|--------------------------------|
| status | Number | The HTTP status code to check. |

#### Returns
`Boolean`: true when the service contains a handler for the specified status.

### `statusCodes()`
Gets the list of HTTP status codes the service has been configured to handle.

#### Arguments
None

#### Returns
`Array[String]`: an array of HTTP status codes.

## Properties

| Name                   | Type   | Details                                                                                                                                                                                             |
|------------------------|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| floodControl.threshold | Number | The number of milliseconds the service will wait before calling handlers for identical HTTP status codes. Setting this to `undefined`, `null`, or `0` will disable Flood Control. Defaults to 1000. |

## Examples

### 1. Handle server error 500
Capture HTTP status code 500, and output the error to the browser's console.

```js
errorz.addHandler(500, function (rejection) {
    console.error("Please try again.", "Server Error 500");
});
```

### 2. Handle multiple server errors
Capture HTTP status codes: -1, 0, 500, using the same handler for all of them. Outputting the error to the browser's console.

```js
errorz.addBatch([-1, 0, 500], function (rejection) {
    console.error("Please try again.", "Server Error " + rejection.status);
});
```

You can do the same thing with multiple calls to `addHandler` instead of `addBatch`. Impractical, for this use case, but here it is for demonstrative purposes:
```js
errorz.addHandler(-1, handler)
    .addHandler(0, handler)
    .addHandler(500, handler);

var handler = function (rejection) {
    console.error("Please try again.", "Server Error " + rejection.status);
};
```

### 3. Handle server errors conditionally
Similar to Example 2, but handle HTTP status code 404 conditionally within the same handler.

```js
errorz.addBatch([-1, 0, 404, 500], function (rejection) {
    rejection.status === 404 && console.warn(rejection.config.url, "404 Not Found")
        || console.error("Please try again.", "Server Error " + rejection.status);
});
```

### 4. Add a handler after the fact
Effectively the same end result as Example 3, just spread out.

```js
errorz.addBatch([-1, 0, 500], function (rejection) {
    console.error("Please try again.", "Server Error " + rejection.status);
});
```

Then, elsewhere/elsewhile...
```js
errorz.addHandler(404, function(rejection) {
    console.warn(rejection.config.url, "404 Not Found");
});
```

### 5. Handle server errors (with toast)
Same as Example 3, but notify the user with [toastr](https://github.com/CodeSeven/toastr) instead of logging to the console. We also enable flood control with a threshold equal to toastr's timeout, to prevent spamming the user with toast when there is a flood of identical errors.

```js
errorz.addBatch([-1, 0, 404, 500], function (rejection) {
    rejection.status === 404 && toastr.warning(rejection.config.url, "404 Not Found")
        || toastr.error("Please try again.", "Server Error " + rejection.status);
}).floodControl.threshold = +toastr.options.timeOut;
```
