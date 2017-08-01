'use strict';

import { Directive, ElementRef } from '@angular/core'

export default Directive({
    selector: '[appModalFocus]'
}).Class({
    // Inspired by https://stackoverflow.com/a/42745350/66629

    constructor: [ElementRef, function AppModalFocusDirective(elementRef) {
        this.elementRef = elementRef

        this.doFocus = false
    }],

    scheduleFocus: function() {
        this.doFocus = true
    },

    ngAfterViewChecked: function() {
        if (this.doFocus) {
            this.elementRef.nativeElement.focus()
            this.doFocus = false
        }
    }
})