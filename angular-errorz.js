/*
 * Angular-Errorz
 * Copyright (C)2014 2Toad, LLC.
 * http://2toad.github.io/Angular-Errorz
 *
 * Version: 2.0.0
 * License: MIT
 */

(function () {
    "use strict";

    angular.module("ttErrorz", [])

    .factory("errorz", [function () {
        var service = {
            handlers: {},
            floodControl: {
              threshold: 1000
            }
        };

        return angular.extend(service, {
            addHandler,
            addBatch,
            handled,
            statusCodes,
            handle
        });

        function addHandler(status, handler) {
            service.handlers[status] = handler;
            return service;
        }

        function addBatch(statuses, handler) {
            angular.forEach(statuses, function (status) {
                addHandler(status, handler);
            });
            return service;
        }

        function handled(status) {
            return service.handlers[status] !== undefined;
        }

        function statusCodes() {
            return Object.keys(service.handlers);
        }

        function handle(rejection) {
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

                if (service.floodControl.threshold
                  && service.floodControl.status === status
                  && service.floodControl.timeout >= now) {
                    console.info("Angular-Errors: Flood Control: status=" + status +
                          " timeout=" + (service.floodControl.timeout - now) + "ms");
                    return true;
                }

                service.floodControl.status = status;
                service.floodControl.timeout = now + service.floodControl.threshold;

                return false;
            }
        }
    }])

    .factory("errorz.interceptor", ["$q", "errorz", function ($q, errorz) {
        return {
            responseError: function (rejection) {
                rejection = errorz.handle(rejection);
                return $q.reject(rejection);
            }
        };
    }])

    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.interceptors.push("errorz.interceptor");
    }]);
}());
