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

angular.module('app').directive('appModalVisible', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var parsedAppModalVisible = $parse(attrs.appModalVisible);

            elem.modal({
                keyboard: false,
                backdrop: 'static',
                show: !!parsedAppModalVisible(scope)
            });

            scope.$watch(attrs.appModalVisible, function (value) {
                elem.modal(value ? 'show' : 'hide');
            });
        }
    };
});
