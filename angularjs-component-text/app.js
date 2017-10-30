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
                var changed = false;

                ngModel.$render = function () {
                    inputEl.val(ngModel.$viewValue);
                }

                inputEl.on('change', function () {
                    changed = true;
                })

                inputEl.on('blur', function () {
                    if (changed) {
                        if (inputEl.val().length === 5) {
                            ngModel.$setViewValue(inputEl.val())
                            inputEl.css({ 'direction': 'rtl' });
                            changed = false;
                        }
                    } else {
                        inputEl.css({ 'direction': 'rtl' });
                    }
                })

                inputEl.on('focus', function () {
                    inputEl.css({ 'direction': 'ltr' });
                    // inputEl[0].select();
                })

            }
        }
    })

function AppMainCtrl($scope) {
    $scope.model = {
        value: 'Hello world'
    }
}
