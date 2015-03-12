
var CustomCR = (function () {
    "use strict";
    /**
     * @description Javascript component for customize inputs type checkbox and radiobutton. This component create a falsely input with markup and synchronize the states.
     * It's compatible with touch screen and accessible.
     * The component use the interaction with the native input, screan readers interact with the native input.     *
     * @param   {json}              params                      Params for the component. All the parameters except listed below (except callbacks) could be indicated by data-customcr-* attributes on native input. Like &gt;input data-customcr-checked="true">
     *                                                          <p>NOTE: All the uppercase letters will be preceded by - in data-customcr- attributes.</p>
     *                                                          <p>For example, for the attribute classInput you have to use &gt;input data-customcr-class-input="classToAddToTheInput"></p>
     * @param   {(boolean|json)}    [params.wrap=false]         If true, the native input, falsely input and the label associated to the native input will be wrapped into a container.
     *                                                          <p>Also it's possible pass a json with extra configuration for the wrapper</p>
     * @param   {String}            [params.wrap.cssClass]      A String with css classes to add to the wrapper
     *                                                          <p>For set this parameter by data-customcr- you have to use data-customcr-class-wrapper="classesToAdd"</p>
     *                                                          <br>The container is created with the _createWrapper function. This function could be overwrite.
     * @param   {String}            [params.classInput]         String with css classes to add to the native input. Will replace the original css class.
     * @param   {String}            [params.classFalselyInput]  String with css classes to add to the falsely input. Will replace the original css class
     * @param   {String}            [params.classCheckbox]      String with css classes to add to the falsely input of type checkbox. Will replace the original css class
     * @param   {String}            [params.classRadio]         String with css classes to add to the falsely input of type radio. Will replace the original css class
     * @param   {String}            [params.classChecked]       String with css classes to add when component be checked. Will replace the original css class
     * @param   {String}            [params.classActive]        String with css classes to add when component be pressed. Will replace the original css class
     * @param   {String}            [params.classHover]         String with css classes to add when component have the mouse hover. Will replace the original css class
     * @param   {String}            [params.classFocus]         String with css classes to add when component have the focus. Will replace the original css class
     * @param   {String}            [params.classLabel]         String with css classes to add to the label. Will replace the original css class
     * @param   {boolean}           [params.disabled=false]     If true, the component will be disabled. This parameter could be indicated in three ways (order and priority are the same):
     *                                                          <ul>
     *                                                              <li>By parameter in params</li>
     *                                                              <li>By data-customcr-disabled attribute on native input</li>
     *                                                              <li>By disabled attribute on native input</li>
     *                                                          </ul>
     *  @param   {boolean}           [params.checked=false]     If true, the component will be checked. This parameter could be indicated in three ways (order and priority are the same):
     *                                                          <ul>
     *                                                              <li>By parameter in params</li>
     *                                                              <li>By data-customcr-checked attribute on native input</li>
     *                                                              <li>By checked attribute on native input</li>
     *                                                          </ul>
     * @param   {function}          [param.onChange]              Event handler for crchange event. It's the same that $(selectorOfInput).on("crchange",function);
     * @param   {function}          [param.onDisable]             Event handler for crdisable event. It's the same that $(selectorOfInput).on("crdisable",function);
     * @constructor
     */
    var CustomCR = function (params) {
        this._init(params);
    };
    CustomCR.prototype = {
        CLASS_CHECKBOX: "cr-checkbox",
        CLASS_RADIO: "cr-radio",
        CLASS_CHECKED: "cr-checked",
        CLASS_FALSELY_INPUT: "cr-input",
        CLASS_INPUT: "cr-nativeInput",
        CLASS_LABEL: "cr-label",
        CLASS_WRAPPER: "cr-container",
        CLASS_FOCUS: "cr-focus",
        CLASS_ACTIVE: "cr-active",
        CLASS_DISABLED: "cr-disabled",
        CLASS_HOVER: "cr-hover",
        EVENT_CHANGE: "crchange",
        EVENT_DISABLED: "crdisable",
        EVENT_NAMESPACE: ".customcr",
        _DEFAULTS: {
            wrap: false,
            disabled: false
        },
        _init: function (params) {
            //get input
            var attributes,
                masterNode = params.masterNode,
                type,
                falselyInput,
                wrapper,
                label,
                disabled,
                checked;
            //merge params and data-* attributes
            params = $.extend({}, params, this._extractDataAttributes(masterNode));
            //merge params and defaults
            this.attributes = $.extend({}, this._DEFAULTS, params);
            attributes = this.attributes;
            //prepare native input
            masterNode = $(masterNode);
            //masterNode is the native input
            type = masterNode.attr("type");
            //find associated label
            label = $('label[for=' + masterNode.attr("id") + ']');
            //create falsely input
            falselyInput = this._createFalseInput(type)
                .attr("aria-role", type);
            //insert falsely input and append native input into falselyInput
            falselyInput.insertAfter(masterNode)
                .append(masterNode);
            //if wrap
            if (attributes.wrap !== false) {
                wrapper = this._createWrapper();
                if ("classWrapper" in attributes === false && (typeof attributes.wrap).toLowerCase() === "object") {
                    attributes.wrapperCssClass = attributes.wrap.cssClass;
                }
                wrapper.insertAfter(falselyInput);
                wrapper.append(label);
                wrapper.append(falselyInput);
                attributes.wrapper = wrapper;
            }
            //add classes to the markup
            attributes.masterNode = masterNode;
            attributes.type = type;
            attributes.label = label;
            attributes.falselyInput = falselyInput;
            //add css classes
            this._addCssClasses();
            //update checked state. If params didn't have checked attribute, component find native input state
            checked = params.checked || (masterNode.attr("checked") === undefined ? false : true);
            this._setChecked(checked);
            //update disabled state. If params didn't have checked attribute, component find native input state
            disabled = params.disabled || (masterNode.attr("disabled") === undefined ? false : true);
            this.disable(disabled);
            //asign internal events
            this._assignEvents();
            //add callbacks
            if (attributes.onChange) {
                masterNode.on("crchange", attributes.onChange);
                attributes.onChange = null;
                delete attributes.onChange;
            }
            if (attributes.onDisabled) {
                masterNode.on("crdisabled", attributes.onDisabled);
                attributes.onDisabled = null;
                delete attributes.onDisabled;
            }
            //avoid the use of _init function
            this._init = null;
            delete this._init;
        },
        /**
         * @description Event assignment
         * @private
         */
        _assignEvents: function () {
            var attributes = this.attributes,
                falselyInput = attributes.falselyInput,
                masterNode = attributes.masterNode,
                label = attributes.label,
                assignEventsToFalselyInput = false;
            //masterNode.on("click"+this.EVENT_NAMESPACE,this._preventDefault);
            masterNode.on("click" + this.EVENT_NAMESPACE +
                          " change" + this.EVENT_NAMESPACE +
                          " focus" + this.EVENT_NAMESPACE +
                          " blur" + this.EVENT_NAMESPACE +
                          " keydown" + this.EVENT_NAMESPACE +
                          " keyup" + this.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
            masterNode.on("crrefresh" + this.EVENT_NAMESPACE, {instance: this}, this._onRefreshEvent);
            //if label exists, assign events for mouse and touch (hover, active, focus)
            if (label) {
                label.on("touchstart" + this.EVENT_NAMESPACE +
                         " touchend" + this.EVENT_NAMESPACE +
                         " mousedown" + this.EVENT_NAMESPACE +
                         " mouseup" + this.EVENT_NAMESPACE +
                         " mouseover" + this.EVENT_NAMESPACE +
                         " mouseout" + this.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
                //if the label is the parent of falselyInput, assign click event to the label
                if (falselyInput.parents("label").length === 0) {
                    assignEventsToFalselyInput = true;
                }
            }
            //if the label is the parent of falselyInput, is not necessary assign events to the falselyInput because mouse and touch events always be triggered on label. This improve event management
            if (assignEventsToFalselyInput === true) {
                falselyInput.on("click" + this.EVENT_NAMESPACE +
                                " touchstart" + this.EVENT_NAMESPACE +
                                " touchend" + this.EVENT_NAMESPACE +
                                " mousedown" + this.EVENT_NAMESPACE +
                                " mouseup" + this.EVENT_NAMESPACE +
                                " mouseover" + this.EVENT_NAMESPACE +
                                " mouseout" + this.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
            }
        },
        /**
         * @description Set or get the checked state of the component.
         * If isChecked argument is passed, the component will be changed to isChecked state.
         * If isChecked argument isn't passed, return the current checked state.
         * @param {boolean}     [isChecked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
         * @fires CustomCR#crchange
         * @returns {boolean}
         */
        check: function (isChecked) {
            if (isChecked !== undefined) {
                if (this.attributes.checked !== isChecked) {
                    this._setChecked(isChecked);
                    this.attributes.masterNode.trigger("crchange", [this, isChecked]);
                }
            } else {
                return this.attributes.checked;
            }
        },
        /**
         * @description Refresh checked and disabled states if the attr disabled or checked property of the input was changed
         */
        refresh: function () {
            var attributes = this.attributes,
                masterNode = attributes.masterNode,
                disabled = masterNode.attr("disabled") === undefined ? false : true,
                checked = masterNode.prop("checked");
            this.check(checked);
            this.disable(disabled);
        },
        /**
         * @description Toggle the checked state of the component.
         */
        toggle: function () {
            this.check(!this.attributes.checked);
        },
        /**
         * @description Set or get the disabled property of the component.
         * If isDisabled argument is passed, the component will be changed to isDisabled state.
         * If isDisabled argument isn't passed, return the current disable state.
         * @param isDisabled
         */
        disable: function (isDisabled) {
            var attributes = this.attributes,
                masterNode = attributes.masterNode;
            if (attributes.disabled !== isDisabled || masterNode.prop("disabled") !== attributes.disabled) {
                attributes.disabled = isDisabled;
                masterNode.prop("disabled", isDisabled);
                this._updateState(isDisabled, (attributes.classDisabled || this.CLASS_DISABLED));
                if (isDisabled) {
                    masterNode.attr("disabled", "disabled");
                } else {
                    masterNode.removeAttr("disabled");
                }
            }
        },
        destroy: function () {

        },
        /**
         * @description Add the necessary classes to the markup
         * @private
         */
        _addCssClasses: function () {
            var attributes = this.attributes,
                masterNode = attributes.masterNode,
                label = attributes.label,
                falselyInput = attributes.falselyInput,
                wrapper = attributes.wrapper;

            masterNode.addClass((attributes.classInput || this.CLASS_INPUT));
            falselyInput.addClass((attributes.classFalselyInput || this.CLASS_FALSELY_INPUT) + " " + (attributes.type === "checkbox" ? (attributes.classCheckbox || this.CLASS_CHECKBOX) : (attributes.classRadio || this.CLASS_RADIO)));
            if (label) {
                label.addClass((attributes.classLabel || this.CLASS_LABEL));
            }
            if (wrapper) {
                wrapper.addClass((attributes.classWrapper || this.CLASS_WRAPPER));
            }
        },
        /**
         * @description Create markup for the wrapper
         * @returns {jQuery}
         * @protected
         */
        _createWrapper: function () {
            return $("<div></div>");
        },
        /**
         * @description Create markup for the falsely input
         * @returns {jQuery}
         * @protected
         */
        _createFalseInput: function () {
            return $("<i></i>");
        },
        /**
         * @description Extract and normalize data-customcr-* attributes from a element.
         * @param {jQuery} masterNode Element to extract attributes
         * @returns {json}
         * @see http://api.jquery.com/jquery.data/
         * @private
         */
        _extractDataAttributes: function (masterNode) {
            //extract data-attributes
            var params = masterNode.data();
            var parsedParams = {};
            for (var key in params) {
                var parsedKey = key.replace("customcr", "");
                parsedKey = parsedKey.charAt(0).toLowerCase().concat(parsedKey.substring(1));
                parsedParams[parsedKey] = params[key];
            }
            return parsedParams;
        },
        /**
         * @description Set or get the checked state of the component.
         * If isChecked argument is passed, the component will be changed to isChecked state.
         * If isChecked argument isn't passed, return the current checked state.
         * Refresh the radio of the same group
         * @param {boolean}     [isChecked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
         */
        _setChecked: function (checked) {
            var attributes = this.attributes,
                masterNode = attributes.masterNode;
            if (attributes.disabled === false) {
                attributes.checked = checked;
                //update classes
                this._updateState(checked, (attributes.classChecked || this.CLASS_CHECKED));
                //update aria state
                attributes.falselyInput.attr("aria-checked", checked);
                //update checked attribute
                if (checked === true) {
                    masterNode.attr("checked", "checked");
                } else {
                    masterNode.removeAttr("checked");
                }
                //if the property checked isn't equal to the new checked state, update the property and fire native change
                if (masterNode.prop("checked") !== checked) {
                    masterNode.prop("checked", checked);
                    //prevent infinite loops
                    attributes.ignoreChangeEvent = true;
                    masterNode.trigger("change");
                }
                //if type is radio, refresh the radios of the same group
                if (attributes.type === "radio" && checked === true) {
                    $("[name='" + masterNode.attr("name") + "']").not(masterNode).trigger("crrefresh");
                }
            }
        },
        /**
         * @description Update the css class of the markup
         * @param {boolean}     state       If true, css classes will be added. If false, css classes will be removed
         * @param {String}      cssClass    Css classes to add o remove.
         * @private
         */
        _updateState: function (state, cssClass) {
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
        _updateHoverState: function (isHover) {
            this._updateState(isHover, (this.attributes.classHover || this.CLASS_HOVER));
        },
        _updateActiveState: function (isActive) {
            this._updateState(isActive, (this.attributes.classActive || this.CLASS_ACTIVE));
        },
        _updateFocusState: function (hasFocus) {
            this._updateState(hasFocus, (this.attributes.classFocus || this.CLASS_FOCUS));
        },
        _onMouseOver: function () {
            if (this.attributes.touchEnd === false) {
                this._updateHoverState(true);
            } else {
                this.attributes.touchEnd = false;
            }
        },
        _onKeyDown: function (keyCode) {
            //control too much events
            if (this.attributes.keyDown !== true) {
                this.attributes.keyDown = true;
                if (keyCode === 13 || keyCode === 32) {
                    this._updateActiveState(true);
                }
            }
        },
        _onKeyUp: function (keyCode) {
            this.attributes.keyDown = false;
            if (keyCode === 13 || keyCode === 32) {
                this._updateActiveState(false);
            }
        },
        _onEventTriggered: function (e) {
            var data = e.data,
                instance = data.instance,
                type = e.type;
            switch (type) {
                case "click":
                    console.log("click", e);
                    var target = e.target,
                        attributes = instance.attributes,
                        masterNode = attributes.masterNode;
                    if (target === attributes.falselyInput.get(0)) {
                        if (attributes.type !== "radio" || masterNode.prop("checked") === false) {
                            instance.check(!masterNode.prop("checked"));
                        }
                    } else if (target === masterNode.get(0)) {
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
                        //if native input trigger check and isn't triggered by the component check for checked state
                        // first check the property checked
                        // if the property checked is the same that the checked attribute of the component
                        // check the attribute checked
                        var attributes = instance.attributes,
                            masterNode = attributes.masterNode,
                            checked = masterNode.prop("checked");
                        if (checked === attributes.checked) {
                            checked = masterNode.attr("checked") === undefined ? false : true;
                        }
                        instance.check(checked);
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
        _onTouchEnd: function () {
            this.attributes.touchEnd = true;
        },
        _onRefreshEvent: function (e) {
            e.data.instance.refresh();
        }
    };
    return CustomCR;
})();