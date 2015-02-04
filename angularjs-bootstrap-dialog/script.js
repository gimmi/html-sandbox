angular.module('app', []);

angular.module('app').controller('appMainCtrl', function ($scope) {
    $scope.model = {
        settingsDialogVisible: false
    };

    $scope.openSettingsDialog = function() {
        $scope.model.settingsDialogVisible = true;
    };

    $scope.closeSettingsDialog = function() {
        $scope.model.settingsDialogVisible = false;
    };
});

angular.module('app').directive('appDialog', function ($parse) {
    return {
        restrict: 'E',
        transclude: true,
        template: [
            '<div class="modal fade" tabindex="-1">',
            '    <div class="modal-dialog">',
            '        <div class="modal-content" ng-transclude>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('\n'),
        link: function (scope, elem, attrs) {
            var modalDivEl = elem.children();
            var parsedAppVisible = $parse(attrs.appVisible);
            var isUpdating = false;

            modalDivEl.modal({
                show: !!parsedAppVisible(scope)
            });

            modalDivEl.on('hide.bs.modal', function () {
                checkUpdating(function() {
                    scope.$apply(function () {
                        parsedAppVisible.assign(scope, false);
                    });
                });
            });

            modalDivEl.on('show.bs.modal', function () {
                checkUpdating(function() {
                    scope.$apply(function() {
                        parsedAppVisible.assign(scope, true);
                    });
                });
            });

            scope.$watch(attrs.appVisible, function (value) {
                checkUpdating(function () {
                    modalDivEl.modal(value ? 'show' : 'hide');
                });
            });

            function checkUpdating(fn) {
                if (isUpdating) {
                    return;
                }
                isUpdating = true;
                try {
                    fn();
                } finally {
                    isUpdating = false;
                }
            }
        }
    };
});
