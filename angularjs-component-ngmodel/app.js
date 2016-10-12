angular.module('app', []);

angular.module('app')
    .controller('appMainCtrl', AppMainCtrl)
    .component('appCmp', {
        template: [
            '<div class="panel panel-default">',
            '  <div class="panel-heading">appCmp</div>',
            '  <div class="panel-body">',
            '    <button type="button" class="btn btn-default" ng-click="$ctrl.click()">Click</button>',
            '    <p>value = {{$ctrl.value}}</p>',
            '  </div>',
            '</div>'
        ].join(''),
        require: {
            ngModel: 'ngModel'
        },
        controller: AppCmpCtrl
    })

function AppMainCtrl($scope) {
    $scope.model = {
        value: 'Hello world'
    }
}

function AppCmpCtrl() {
    var ctrl = this

    ctrl.value = ''
    ctrl.$onInit = onInit
    ctrl.click = click

    function onInit() {
        ctrl.ngModel.$render = ngModelRender
    }

    function ngModelRender() {
        ctrl.value = ctrl.ngModel.$viewValue
    }

    function click() {
        ctrl.value = ctrl.value + ' click'
        ctrl.ngModel.$setViewValue(ctrl.value)
    }
}