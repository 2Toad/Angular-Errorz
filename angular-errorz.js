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
        var self = {
            handlers: {},
            flooder: {},
            addHandler: function(errorCode, handler) {
                self.handlers[errorCode] = handler;
            },
            handled: function(errorCode) {
              return self.handlers[errorCode] !== undefined;
            },
            handledErrorCodes: function () {
                return Object.keys(self.handlers);
            },
            init: function (handlers, callback, floodThreshold) {
                self.flooder.threshold = floodThreshold;

                if (callback) {
                    angular.forEach(handlers, function (handler) {
                        self.handlers[handler] = callback;
                    });
                } else angular.extend(self.handlers, handlers);
            },
            onError: function(rejection) {
                if (!flooded(rejection.status)) {
                    var handler = self.handlers[rejection.status];
                    if (handler !== undefined) {
                        var r = handler(rejection);
                        if (r) rejection = r;
                    }
                }
                return rejection;
            }
        };

        return self;

        function flooded(status) {
            var now = Date.now();

            if (self.flooder.threshold && self.flooder.status === status && self.flooder.timeout >= now) {
                console.info("Angular-Errors: flooded status=" + status + " timeout=" + (self.flooder.timeout - now) + "ms");
                return true;
            }

            self.flooder.status = status;
            self.flooder.timeout = now + self.flooder.threshold;

            return false;
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
