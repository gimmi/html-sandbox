angular.module('app', []);

angular.module('app').controller('appMainCtrl', function ($scope) {
    $scope.states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
        'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
        'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
        'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    $scope.state = $scope.states[0];
});

angular.module('app').directive('appTypeahead', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelController) {
            var values = [],
                ttFn = function ttFn(q, cb) {
                    var matches = [],
                        substrRegex = new RegExp(q, 'i');

                    angular.forEach(values, function(value) {
                        if (substrRegex.test(value)) {
                            matches.push(value);
                        }
                    });

                    cb(matches);
                };

            elem.typeahead({
              hint: true,
              highlight: true,
              minLength: 2
            }, {
              displayKey: function (value) { return value; },
              source: ttFn
            });

            elem.on('typeahead:selected', function (evt, value) {
                ngModelController.$setViewValue(value);
            });

            scope.$watch(attrs.appTypeahead, function (value) {
                values = value;
            });
        }
    };
});
