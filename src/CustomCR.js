var CustomCR = (function () {
    "use strict";
    var CustomCR = function (params) {
        this._init(params);
    };
    CustomCR.prototype = {
        CLASS_CHECKBOX        : "cr-checkbox",
        CLASS_RADIO           : "cr-radio",
        CLASS_CHECKED         : "cr-checked",
        CLASS_FALSELY_INPUT   : "cr-input",
        CLASS_INPUT           : "cr-nativeInput",
        CLASS_LABEL           : "cr-label",
        CLASS_WRAPPER         : "cr-container",
        CLASS_FOCUS           : "cr-focus",
        CLASS_ACTIVE          : "cr-active",
        CLASS_DISABLED        : "cr-disabled",
        CLASS_HOVER           : "cr-hover",
        EVENT_CHANGE          : "crchange",
        EVENT_NAMESPACE       : ".customcr",
        _DEFAULTS             : {
            wrap: false,
            disabled: false
        },
        _init                 : function (params) {
            //get input
            var attributes,
                parent,
                masterNode = params.masterNode,
                type,
                falselyInput,
                wrapper,
                label;

            params = $.extend({}, params, this._extractDataAttributes(masterNode));
            this.attributes = $.extend({}, this._DEFAULTS, params);
            attributes = this.attributes;
            masterNode = $(masterNode).addClass(this.CLASS_INPUT);
            //masterNode is the native input
            type = masterNode.attr("type");
            //find associated label
            label = $('label[for=' + masterNode.attr("id") + ']').addClass(this.CLASS_LABEL);
            //create falsely input
            falselyInput = this._createFalseInput(type);
            //insert falsely input and append native input into falselyInput
            falselyInput.insertAfter(masterNode)
                .append(masterNode);
            if (attributes.wrap === true) {
                wrapper = this._createWrapper();
                wrapper.insertAfter(falselyInput);
                wrapper.append(label);
                wrapper.append(falselyInput);
                attributes.wrapper = wrapper;
            }
            attributes.masterNode = masterNode;
            attributes.type = type;
            attributes.label = label;
            attributes.falselyInput = falselyInput;
            parent = masterNode.parents("label");
            this._assignEvents(label.length > 0 && parent.length > 0 && parent.get(0) !== label.get(0))
            //create falsely input
            //data on node
        },
        _assignEvents         : function (labelExists) {
            var falselyInput = this.attributes.falselyInput,
                masterNode = this.attributes.masterNode;
            //masterNode.on("click"+this.EVENT_NAMESPACE,this._preventDefault);
            falselyInput.on("click" + this.EVENT_NAMESPACE +
                            " touchstart" + this.EVENT_NAMESPACE +
                            " touchend" + this.EVENT_NAMESPACE +
                            " mousedown" + this.EVENT_NAMESPACE +
                            " mouseup" + this.EVENT_NAMESPACE +
                            " mouseover" + this.EVENT_NAMESPACE +
                            " mouseout" + this.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
            masterNode.on("click" + this.EVENT_NAMESPACE +
                          " change" + this.EVENT_NAMESPACE +
                          " focus" + this.EVENT_NAMESPACE +
                          " blur" + this.EVENT_NAMESPACE +
                          " keydown" + this.EVENT_NAMESPACE +
                          " keyup" + this.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
        },
        check                 : function () {
            this._setChecked(true);
        },
        uncheck               : function () {
            this._setChecked(false);
        },
        toggle                : function () {
            this._setChecked(!this.attributes.masterNode.prop("checked"));
        },
        disable               : function (isDisabled) {

        },
        destroy               : function () {

        },
        _createWrapper        : function () {
            return $('<div class=' + this.CLASS_WRAPPER + '></div>');
        },
        _createFalseInput     : function (type) {
            return $("<div class='" + this.CLASS_FALSELY_INPUT + " " + (type === "checkbox" ? this.CLASS_CHECKBOX : this.CLASS_RADIO) + "'></div>");
        },
        _extractDataAttributes: function (masterNode) {
            //extract data-attributes
            var params = masterNode.data();
            params.disabled = masterNode.attr("disabled");
            return params;
        },
        _setChecked           : function (checked) {
            var attributes = this.attributes,
                masterNode = attributes.masterNode;
            if (attributes.disabled === false || attributes.masterNode.attr("disabled") === undefined) {
                attributes.checked = checked;
                this._updateState(checked, this.CLASS_CHECKED);
                if (masterNode.prop("checked") !== checked) {
                    masterNode.prop("checked", checked);
                    if (checked) {
                        masterNode.attr("checked", "checked");
                    } else {
                        masterNode.removeAttr("checked");
                    }
                    //prevent infinite loops
                    attributes.ignoreChangeEvent = true;
                    masterNode.trigger("change");
                    masterNode.trigger(this.EVENT_CHANGE, [this, checked]);
                }
            }
        },
        _updateState          : function (state, cssClass) {
            var attributes = this.attributes;
            if (attributes.disabled === false || attributes.masterNode.attr("disabled") === undefined) {
                if (state === true) {
                    attributes.falselyInput.addClass(cssClass);
                    attributes.label.addClass(cssClass);
                    if (attributes.wrapper) {
                        attributes.wrapper.addClass(cssClass);
                    }
                } else {
                    attributes.falselyInput.removeClass(cssClass);
                    attributes.label.removeClass(cssClass);
                    if (attributes.wrapper) {
                        attributes.wrapper.removeClass(cssClass);
                    }
                }
            }
        },
        _updateHoverState     : function (isHover) {
            this._updateState(isHover, this.CLASS_HOVER);
        },
        _updateActiveState    : function (isActive) {
            this._updateState(isActive, this.CLASS_ACTIVE);
        },
        _updateFocusState     : function (hasFocus) {
            this._updateState(hasFocus, this.CLASS_FOCUS);
        },
        _onMouseOver          : function () {
            if (this.attributes.touchEnd === false) {
                this._updateHoverState(true);
            } else {
                this.attributes.touchEnd = false;
            }
        },
        _onKeyDown            : function (keyCode) {
            //control too much events
            if (this.attributes.keyDown !== true) {
                this.attributes.keyDown = true;
                if (keyCode === 13 || keyCode === 32) {
                    this._updateActiveState(true);
                }
            }
        },
        _onKeyUp              : function (keyCode) {
            this.attributes.keyDown = false;
            if (keyCode === 13 || keyCode === 32) {
                this._updateActiveState(false);
            }
        },
        _onEventTriggered     : function (e) {
            var data = e.data,
                instance = data.instance,
                type = e.type;
            switch (type) {
                case "click":
                    console.log("click", e);
                    var target = e.target,
                        attributes = instance.attributes;
                    if (target === attributes.falselyInput.get(0)) {
                        instance._setChecked(!attributes.masterNode.prop("checked"));
                    } else if (target === attributes.masterNode.get(0)) {
                        /*by default, the native input is inside of the custom input, if the native input has position and opacity and it's clicked,
                         *the click event is propagated up to the custom input and cause double event. In order to avoid this, when the native input trigger a click event,
                         *the propagation is canceled.
                         *This also control the propagation when native input is child of label (when label is clicked the native input trigger change)*/
                        e.stopPropagation();
                    }
                    break;
                case "touchstart":
                    console.log("touchstart", e);
                    instance._updateActiveState(true);
                    break;
                case "touchend":
                    console.log("touchend", e);
                    instance._updateActiveState(false);
                    //control ghost hover in touch screens
                    instance._onTouchEnd();
                    break;
                case "mousedown":
                    console.log("mousedown", e);
                    instance._updateActiveState(true);
                    break;
                case "mouseup":
                    console.log("mouseup", e);
                    instance._updateActiveState(false);
                    break;
                case "mouseover":
                    console.log("mouseover", e);
                    instance._onMouseOver();
                    break;
                case "mouseout":
                    console.log("mouseout", e);
                    instance._updateHoverState(false);
                    break;
                case "change":
                    if (instance.attributes.ignoreChangeEvent !== true) {
                        console.log("change", e);
                        instance._setChecked(this.checked);
                    } else {
                        instance.attributes.ignoreChangeEvent = false;
                    }
                    break;
                case "focus":
                    console.log("focus", e);
                    instance._updateFocusState(true);
                    break;
                case "blur":
                    console.log("blur", e);
                    instance._updateFocusState(false);
                    break;
                case "keydown":
                    console.log("keydown", e);
                    instance._onKeyDown(e.keyCode);
                    break;
                case "keyup":
                    console.log("keyup", e);
                    instance._onKeyUp(e.keyCode);
                    break;
            }
        },
        _onTouchEnd           : function () {
            this.attributes.touchEnd = true;
        },
        _onInputChange        : function (e) {
        },
        _onFalselyInputOperated: function (e) {
        }
    };
    return CustomCR;
})();