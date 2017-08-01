'use strict';

import _ from 'underscore'
import { Component, ContentChild } from '@angular/core'
import { EventEmitter } from '@angular/core'

import styles from './app-modal.component.css'
import template from './app-modal.component.html'

import AppModalFocusDirective from './app-modal-focus.directive'

export default Component({
    selector: 'app-modal',
    styles: [ styles ],
    template: template,
    outputs: [
        'cancel'
    ],
    queries: {
        appModalFocus: new ContentChild(AppModalFocusDirective) // See https://stackoverflow.com/a/34327754/66629
    }
}).Class({
    constructor: [function AppModalComponent() {
        // Inspired by http://blog.angular-university.io/angular-ng-content/

        this.cancel = new EventEmitter()

        this.resolve = null
    }],

    open: function() {
        var me = this
        if (me.appModalFocus) {
            me.appModalFocus.scheduleFocus()
        }
        return new Promise(function(resolve) { me.resolve = resolve })
    },

    close: function(value) {
        if (this.resolve) {
            this.resolve(value)
            this.resolve = null
        }
    },

    onOverlayKeydown: function(event) {
        if (event.key === 'Escape') {
            event.stopPropagation()
            this.cancel.emit({})
        }
    },

    onOverlayClick: function() {
        this.cancel.emit({})
    }
})
