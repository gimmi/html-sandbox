angular.module('app', []);

angular.module('app')
    .controller('appMainCtrl', AppMainCtrl)
    .directive('appExcelCellCmp', function () {
        return {
            restrict: 'E',
            template: '<input type="text" style="font-family: monospace; direction:RTL;">',
            require: 'ngModel',
            link: function (scope, cmpEl, iAttrs, ngModel) {
                var inputEl = cmpEl.find('input');
                var isChanged = false;

                var state = 'view'; // 'focus' 'edit'

                ngModel.$render = function () {
                    // ngModel.$validate();
                    if (state === 'view') {
                        inputEl.val(formatForView(ngModel.$viewValue));
                    } else if (state === 'focus') {
                        inputEl.val(ngModel.$viewValue);
                        inputEl[0].select();
                    } else if (state === 'edit') {
                        inputEl.val(ngModel.$viewValue);
                        inputEl[0].select();
                    }
                }

                var originalSetValidity = ngModel.$setValidity;
                ngModel.$setValidity = function () {
                    var wasValid = ngModel.$valid
                    var ret = originalSetValidity.apply(this, arguments);

                    return ret;
                };

                inputEl.on('change', function () {
                    if (state === 'view') {
                        // Impossible
                    } else if (state === 'focus') {
                        state = 'edit';
                    } else if (state === 'edit') {
                        // Nothing to do
                    }
                })

                ngModel.$parsers.push(function (value) {
                    return value;
                });

                ngModel.$formatters.push(function (value) {
                    return value;
                });

                ngModel.$validators.validLength = function (modelValue) {
                    return modelValue.length < 5;
                };

                inputEl.on('blur', function () {
                    if (state === 'view') {
                        // Impossible
                    } else if (state === 'focus') {
                        inputEl.css({ 'direction': 'rtl' });
                        inputEl.val(formatForView(ngModel.$viewValue));
                        state = 'view'
                    } else if (state === 'edit') {
                        ngModel.$setViewValue(inputEl.val());
                        // $parsers
                        // $validators
                        inputEl.css({ 'direction': 'rtl' });
                        inputEl.val(formatForView(ngModel.$viewValue));
                        state = 'view'
                    }
                })

                inputEl.on('focus', function () {
                    if (state === 'view') {
                        inputEl.css({ 'direction': 'ltr' });
                        inputEl.val(ngModel.$viewValue);
                        state = 'focus';
                    } else if (state === 'focus') {
                        // Impossible
                    } else if (state === 'edit') {
                        // Impossible
                    }
                });

                function formatForView(viewValue) {
                    return '**' + viewValue;
                }
            }
        }
    })

function AppMainCtrl($scope) {
    $scope.model = {
        value: 'Hello world'
    }
}
