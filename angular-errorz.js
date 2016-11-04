/*
 * Angular-Errorz
 * Copyright (C)2014 2Toad, LLC.
 * http://2toad.github.io/Angular-Errorz
 *
 * Version: 1.2.0
 * License: MIT
 */

(function () {
    "use strict";

    angular.module("ttErrorz", [])

    .factory("errorz", [function () {
        var service = {
            handlers: {},
            flooder: {}
        };

        return angular.extend(service, {
            init,
            addHandler,
            handled,
            handledErrorCodes,
            onError
        });

        function init(handlers, callback, floodThreshold) {
            service.flooder.threshold = floodThreshold;

            if (callback) {
                angular.forEach(handlers, function (handler) {
                    service.handlers[handler] = callback;
                });
            } else angular.extend(service.handlers, handlers);
        }

        function addHandler(errorCode, handler) {
            service.handlers[errorCode] = handler;
        }

        function handled(errorCode) {
            return service.handlers[errorCode] !== undefined;
        }

        function handledErrorCodes() {
            return Object.keys(service.handlers);
        }

        function onError(rejection) {
            if (!flooded(rejection.status)) {
                var handler = service.handlers[rejection.status];
                if (handler !== undefined) {
                    var r = handler(rejection);
                    if (r) rejection = r;
                }
            }

            return rejection;

            function flooded(status) {
                var now = Date.now();

                if (service.flooder.threshold && service.flooder.status === status && service.flooder.timeout >= now) {
                    console.info("Angular-Errors: flooded status=" + status + " timeout=" + (service.flooder.timeout - now) + "ms");
                    return true;
                }

                service.flooder.status = status;
                service.flooder.timeout = now + service.flooder.threshold;

                return false;
            }
        }
    }])

    .factory("errorz.interceptor", ["$q", "errorz", function ($q, errorz) {
        return {
            responseError: function (rejection) {
                rejection = errorz.onError(rejection);
                return $q.reject(rejection);
            }
        };
    }])

    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push("errorz.interceptor");
    }]);
}());
