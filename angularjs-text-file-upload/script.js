'use strict';

angular.module('app', []);

angular.module('app').controller('mainCtrl', function($scope) {
    $scope.model = {
        description: '',
        file: ''
    };
})

angular.module('app').directive('textFileReader', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelController) {
            elem.on('change', function() {
                var file = elem[0].files[0];
                if (file) {
                    var fileReader = new FileReader();
                    fileReader.onloadend = function() {
                        var text = fileReader.result;
                        ngModelController.$setViewValue(text);
                    }
                    fileReader.readAsText(file, 'utf-8');
                } else {
                    ngModelController.$setViewValue('');
                }
            });
        }
    }
});
