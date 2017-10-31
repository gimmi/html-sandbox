angular.module('app', []);

angular.module('app')
    .controller('appMainCtrl', function AppMainCtrl($scope) {
        $scope.model = {
            value: 'Hello world'
        }

        $scope.fn = function (action, modelValue, viewValue) {
            console.log('action:', action, 'modelValue:', modelValue, 'viewValue:', viewValue);
            if (action === 'parser') {
                return viewValue;
            } else if (action === 'formatter') {
                return modelValue;
            } else if (action === 'validator') {
                return true;
            }
        }
    })
    .directive('appModelHandler', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var fn = scope.$eval(attrs.appModelHandler);
                scope.$watch(attrs.appModelHandler, function (value) {
                    fn = value;
                });

                ngModel.$parsers.push(function (viewValue) {
                    if (angular.isFunction(fn)) {
                        return fn('parser', undefined, viewValue);
                    }
                    return viewValue;
                });

                ngModel.$formatters.push(function (modelValue) {
                    if (angular.isFunction(fn)) {
                        return fn('formatter', modelValue, undefined);
                    }
                    return modelValue;
                });

                ngModel.$validators['appModelHandler'] = function (modelValue, viewValue) {
                    if (angular.isFunction(fn)) {
                        return fn('validator', modelValue, viewValue);
                    }
                    return false; // bad directive setup result in validation error
                };
            }
        };
    });
