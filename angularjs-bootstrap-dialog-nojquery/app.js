angular.module('app', []);

angular.module('app').controller('appMainCtrl', AppMainCtrl);

function AppMainCtrl($scope) {
    $scope.model = {
        closeFn: null
    }
    $scope.openDialog = openDialog

    function openDialog() {
        console.log('Will open dialog')
        $scope.model.closeFn = closeDialog
    }

    function closeDialog() {
        console.log('Will close dialog')
        $scope.model.closeFn = null
    };
}
