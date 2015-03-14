/// <reference path="../external/jquery.d.ts" />
"use strict";
/**
 * @class
 * @description Javascript UI component for customize checkbox and radio buttons.
 * This script create some markdown and synchronize them with the native input.
 * @use JQuery
 */
var CustomCR = (function () {
    /**
     * @description Javascript component for customize inputs type checkbox and radiobutton. This component create a falsely input with markup and synchronize the states.
     * It's compatible with touch screen and accessible.
     * The component use the interaction with the native input, screan readers interact with the native input.     *
     * @param   {json}              params                      Params for the component. All the parameters except listed below (except callbacks) could be indicated by data-customcr-* _attributes on native input. Like &gt;input data-customcr-checked="true">
     *                                                          <p>NOTE: All the uppercase letters will be preceded by - in data-customcr- _attributes.</p>
     *                                                          <p>For example, for the attribute classInput you have to use &gt;input data-customcr-class-input="classToAddToTheInput"></p>
     * @param   {(boolean|JSON)}    [params.wrap=false]         If true, the native input, falsely input and the label associated to the native input will be wrapped into a container.
     *                                                          <p>Also it's possible pass a json with extra configuration for the wrapper</p>
     * @param   {String}            [params.wrap.cssClass]      A String with css classes to add to the wrapper
     *                                                          <p>For set this parameter by data-customcr- you have to use data-customcr-class-wrapper="classesToAdd"</p>
     *                                                          <br>The container is created with the _createWrapper function. This function could be overwrite.
     * @param   {String}            [params.classWrapper]       String with css classes to add to the wrapper. Will replace the original css class
     * @param   {String}            [params.classInput]         String with css classes to add to the native input. Will replace the original css class.
     * @param   {String}            [params.classFalselyInput]  String with css classes to add to the falsely input. Will replace the original css class
     * @param   {String}            [params.classCheckbox]      String with css classes to add to the falsely input of type checkbox. Will replace the original css class
     * @param   {String}            [params.classRadio]         String with css classes to add to the falsely input of type radio. Will replace the original css class
     * @param   {String}            [params.classChecked]       String with css classes to add when component be checked. Will replace the original css class
     * @param   {String}            [params.classActive]        String with css classes to add when component be pressed. Will replace the original css class
     * @param   {String}            [params.classHover]         String with css classes to add when component have the mouse hover. Will replace the original css class
     * @param   {String}            [params.classFocus]         String with css classes to add when component have the focus. Will replace the original css class
     * @param   {String}            [params.classDisabled]      String with css classes to add when component are disabled. Will replace the original css class
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
     * @param   {function}          [params.onChange]              Event handler for crchange event. It's the same that $(selectorOfInput).on("crchange",function);
     * @param   {function}          [params.onDisable]             Event handler for crdisable event. It's the same that $(selectorOfInput).on("crdisable",function);
     * @constructor
     */
    function CustomCR(params) {
        //get input
        var attributes, masterNode = params.masterNode, inputType, falselyInput, wrapper, label, disabled, checked, mergedParams;
        //merge params and data-* _attributes
        mergedParams = $.extend({}, params, CustomCR._extractDataAttributes(masterNode));
        //merge params and defaults
        attributes = $.extend({}, CustomCR._DEFAULTS, mergedParams);
        this._attributes = attributes;
        //prepare native input
        masterNode = $(masterNode);
        //masterNode is the native input
        inputType = masterNode.attr("type");
        //find associated label
        label = $('label[for=' + masterNode.attr("id") + ']');
        //create falsely input
        falselyInput = this._createFalseInput(inputType).attr("aria-role", inputType);
        //insert falsely input and append native input into falselyInput
        falselyInput.insertAfter(masterNode).append(masterNode);
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
        attributes.type = inputType;
        attributes.label = label;
        attributes.falselyInput = falselyInput;
        //add css classes
        this._addCssClasses();
        //update checked state. If params didn't have checked attribute, component find native input state
        checked = params.checked || (masterNode.attr("checked") !== undefined);
        this._setChecked(checked);
        //update disabled state. If params didn't have checked attribute, component find native input state
        disabled = params.disabled || (masterNode.attr("disabled") !== undefined);
        this.disable(disabled);
        //asign internal events
        this._assignEvents();
        masterNode.data("CustomCR", this);
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
    }
    /**
     * @description Event assignment
     * @private
     */
    CustomCR.prototype._assignEvents = function () {
        var attributes = this._attributes, falselyInput = attributes.falselyInput, masterNode = attributes.masterNode, label = attributes.label, assignEventsToFalselyInput = false;
        //masterNode.on("click"+this.EVENT_NAMESPACE,this._preventDefault);
        masterNode.on("click" + CustomCR.EVENT_NAMESPACE + " change" + CustomCR.EVENT_NAMESPACE + " focus" + CustomCR.EVENT_NAMESPACE + " blur" + CustomCR.EVENT_NAMESPACE + " keydown" + CustomCR.EVENT_NAMESPACE + " keyup" + CustomCR.EVENT_NAMESPACE, { instance: this }, this._onEventTriggered);
        masterNode.on(CustomCR.EVENT_REFRESH + CustomCR.EVENT_NAMESPACE, { instance: this }, this._onRefreshEvent);
        //if label exists, assign events for mouse and touch (hover, active, focus)
        if (label) {
            label.on("touchstart" + CustomCR.EVENT_NAMESPACE + " touchend" + CustomCR.EVENT_NAMESPACE + " mousedown" + CustomCR.EVENT_NAMESPACE + " mouseup" + CustomCR.EVENT_NAMESPACE + " mouseover" + CustomCR.EVENT_NAMESPACE + " mouseout" + CustomCR.EVENT_NAMESPACE, { instance: this }, this._onEventTriggered);
            //if the label is the parent of falselyInput, assign click event to the label
            if (falselyInput.parents("label").length === 0) {
                assignEventsToFalselyInput = true;
            }
        }
        //if the label is the parent of falselyInput, is not necessary assign events to the falselyInput because mouse and touch events always be triggered on label. This improve event management
        if (assignEventsToFalselyInput === true) {
            falselyInput.on("click" + CustomCR.EVENT_NAMESPACE + " touchstart" + CustomCR.EVENT_NAMESPACE + " touchend" + CustomCR.EVENT_NAMESPACE + " mousedown" + CustomCR.EVENT_NAMESPACE + " mouseup" + CustomCR.EVENT_NAMESPACE + " mouseover" + CustomCR.EVENT_NAMESPACE + " mouseout" + CustomCR.EVENT_NAMESPACE, { instance: this }, this._onEventTriggered);
        }
    };
    /**
     * @description Set or get the checked state of the component.
     * If isChecked argument is passed, the component will be changed to isChecked state.
     * If isChecked argument isn't passed, return the current checked state.
     * @param {boolean}     [isChecked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
     * @fires CustomCR#crchange
     * @returns {boolean}
     */
    CustomCR.prototype.check = function (isChecked) {
        if (isChecked !== undefined) {
            if (this._attributes.checked !== isChecked) {
                this._setChecked(isChecked);
            }
        }
        else {
            return this._attributes.checked;
        }
    };
    /**
     * @description Refresh checked and disabled states if the attr disabled or checked property of the input was changed
     */
    CustomCR.prototype.refresh = function () {
        var attributes = this._attributes, masterNode = attributes.masterNode, disabled = masterNode.attr("disabled") !== undefined, checked = masterNode.prop("checked");
        this.check(checked);
        this.disable(disabled);
    };
    /**
     * @description Toggle the checked state of the component.
     */
    CustomCR.prototype.toggle = function () {
        this.check(!this._attributes.checked);
    };
    /**
     * @description Set or get the disabled property of the component.
     * If isDisabled argument is passed, the component will be changed to isDisabled state.
     * If isDisabled argument isn't passed, return the current disable state.
     * @param isDisabled
     */
    CustomCR.prototype.disable = function (isDisabled) {
        var attributes = this._attributes, masterNode = attributes.masterNode;
        if (isDisabled !== undefined) {
            if (attributes.disabled !== isDisabled || masterNode.prop("disabled") !== attributes.disabled) {
                attributes.disabled = isDisabled;
                masterNode.prop("disabled", isDisabled);
                this._updateState(isDisabled, (attributes.classDisabled || CustomCR.CLASS_DISABLED));
                if (isDisabled) {
                    masterNode.attr("disabled", "disabled");
                }
                else {
                    masterNode.removeAttr("disabled");
                }
            }
        }
        else {
            return this._attributes.disabled;
        }
    };
    CustomCR.prototype.destroy = function () {
    };
    /**
     * @description Add the necessary classes to the markup
     * @private
     */
    CustomCR.prototype._addCssClasses = function () {
        var attributes = this._attributes, masterNode = attributes.masterNode, label = attributes.label, falselyInput = attributes.falselyInput, wrapper = attributes.wrapper;
        masterNode.addClass((attributes.classInput || CustomCR.CLASS_INPUT));
        falselyInput.addClass((attributes.classFalselyInput || CustomCR.CLASS_FALSELY_INPUT) + " " + (attributes.type === "checkbox" ? (attributes.classCheckbox || CustomCR.CLASS_CHECKBOX) : (attributes.classRadio || CustomCR.CLASS_RADIO)));
        if (label) {
            label.addClass((attributes.classLabel || CustomCR.CLASS_LABEL));
        }
        if (wrapper) {
            wrapper.addClass((attributes.classWrapper || CustomCR.CLASS_WRAPPER));
        }
    };
    /**
     * @description Create markup for the wrapper
     * @returns {jQuery}
     * @protected
     */
    CustomCR.prototype._createWrapper = function () {
        return $("<div></div>");
    };
    /**
     * @description Create markup for the falsely input
     * @returns {jQuery}
     * @protected
     */
    CustomCR.prototype._createFalseInput = function (type) {
        return $("<i></i>");
    };
    /**
     * @description Extract and normalize data-customcr-* _attributes from a element.
     * @param {jQuery} masterNode Element to extract _attributes
     * @returns {JSON}
     * @see http://api.jquery.com/jquery.data/
     * @private
     */
    CustomCR._extractDataAttributes = function (masterNode) {
        //extract data-_attributes
        var params = masterNode.data();
        var parsedParams = {};
        for (var key in params) {
            var parsedKey = key.replace("customcr", "");
            parsedKey = parsedKey.charAt(0).toLowerCase().concat(parsedKey.substring(1));
            parsedParams[parsedKey] = params[key];
        }
        return parsedParams;
    };
    /**
     * @description Set or get the checked state of the component.
     * If checked argument is passed, the component will be changed to isChecked state.
     * If checked argument isn't passed, return the current checked state.
     * Refresh the radio of the same group
     * @param {boolean}     [checked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
     */
    CustomCR.prototype._setChecked = function (checked) {
        var attributes = this._attributes, masterNode = attributes.masterNode, currentChecked = masterNode.prop("checked");
        if (attributes.disabled === false) {
            if (checked === currentChecked) {
                attributes.checked = currentChecked;
                //update classes
                this._updateState(checked, (attributes.classChecked || CustomCR.CLASS_CHECKED));
                //update aria state
                //if type is radio, refresh the radios of the same group
                attributes.falselyInput.attr("aria-checked", checked);
                if (attributes.type === "radio" && checked === true) {
                    ;
                    $("[name='" + masterNode.attr("name") + "']").not(masterNode).trigger(CustomCR.EVENT_REFRESH);
                    masterNode.trigger(CustomCR.EVENT_CHANGE);
                }
                else if (attributes.type === "checkbox") {
                    masterNode.trigger(CustomCR.EVENT_CHANGE);
                }
            }
            else {
                //If the checked property isn't equal to checked param, request to the input for update
                //It's the input itself the responsible of manage his states
                masterNode.trigger("click");
            }
        }
    };
    /**
     * @description Update the css class of the markup
     * @param {boolean}     state       If true, css classes will be added. If false, css classes will be removed
     * @param {String}      cssClass    Css classes to add o remove.
     * @private
     */
    CustomCR.prototype._updateState = function (state, cssClass) {
        var attributes = this._attributes;
        if (attributes.disabled === false || attributes.masterNode.attr("disabled") === undefined) {
            if (state === true) {
                attributes.falselyInput.addClass(cssClass);
                attributes.label.addClass(cssClass);
                if (attributes.wrapper) {
                    attributes.wrapper.addClass(cssClass);
                }
            }
            else {
                attributes.falselyInput.removeClass(cssClass);
                attributes.label.removeClass(cssClass);
                if (attributes.wrapper) {
                    attributes.wrapper.removeClass(cssClass);
                }
            }
        }
    };
    CustomCR.prototype._updateHoverState = function (isHover) {
        this._updateState(isHover, (this._attributes.classHover || CustomCR.CLASS_HOVER));
    };
    CustomCR.prototype._updateActiveState = function (isActive) {
        this._updateState(isActive, (this._attributes.classActive || CustomCR.CLASS_ACTIVE));
    };
    CustomCR.prototype._updateFocusState = function (hasFocus) {
        this._updateState(hasFocus, (this._attributes.classFocus || CustomCR.CLASS_FOCUS));
    };
    CustomCR.prototype._onMouseOver = function () {
        if (this._attributes.touchEnd === false) {
            this._updateHoverState(true);
        }
        else {
            this._attributes.touchEnd = false;
        }
    };
    CustomCR.prototype._onKeyDown = function (e) {
        //control too much events
        if (this._attributes.keyDown !== true) {
            this._attributes.keyDown = true;
            if (e.keyCode === 13 || e.keyCode === 32) {
                this._updateActiveState(true);
            }
        }
    };
    CustomCR.prototype._onKeyUp = function (e) {
        this._attributes.keyDown = false;
        if (e.keyCode === 13 || e.keyCode === 32) {
            this._updateActiveState(false);
        }
    };
    /**
     * @description This function is invoked when any of the events are triggered.
     * click:
     * FalselyInput: When the falsely input is clicked, the algorithm detects if the type of the input is checkbox or radio and invoke check function</p>
     * NativeInput: When the native input is clicked, the algorithm detects if the event has been triggered by the component and cancels the default behavior. Additionally, the propagation is prevented
     * touchstart, mousedown
     * FalselyInput: Set the active state to true.
     * touchend, mouseup
     * FalselyInput: Set the active state to false.
     * mouseover
     * FalselyInput: Set the mouseHover state to true. Touchend prevents mouseleave event on touch screen devices to fix the hover ghost issue.
     * mouseout
     * FalselyInput: Set the mouseHover state to false.
     * change:
     * NativeInput:
     * @param e
     * @private
     */
    CustomCR.prototype._onEventTriggered = function (e) {
        var data = e.data, instance = data.instance, type = e.type;
        switch (type) {
            case "click":
                //console.log("click", e);
                var target = e.target, attributes = instance._attributes, masterNode = attributes.masterNode;
                if (target === attributes.falselyInput.get(0)) {
                    if (attributes.type !== "radio" || masterNode.prop("checked") === false) {
                        instance.check(!masterNode.prop("checked"));
                    }
                }
                else if (target === masterNode.get(0)) {
                    /*by default, the native input is inside of the custom input, if the native input has position and opacity and it's clicked,
                     *the click event is propagated up to the custom input and cause double event. In order to avoid this, when the native input trigger a click event,
                     *the propagation is canceled.
                     *This also control the propagation when native input is child of label (when label is clicked the native input trigger change)*/
                    e.stopPropagation();
                }
                break;
            case "touchstart":
                //console.log("touchstart", e);
                instance._updateActiveState(true);
                break;
            case "touchend":
                //console.log("touchend", e);
                instance._updateActiveState(false);
                //control ghost hover in touch screens
                instance._onTouchEnd();
                break;
            case "mousedown":
                //console.log("mousedown", e);
                instance._updateActiveState(true);
                break;
            case "mouseup":
                //console.log("mouseup", e);
                instance._updateActiveState(false);
                break;
            case "mouseover":
                //console.log("mouseover", e);
                instance._onMouseOver();
                break;
            case "mouseout":
                //console.log("mouseout", e);
                instance._updateHoverState(false);
                break;
            case "change":
                //console.log("change", e)
                //if native input trigger check and isn't triggered by the component check for checked state
                // first check the property checked
                // if the property checked is the same that the checked attribute of the component
                // check the attribute checked
                var attributes = instance._attributes, masterNode = attributes.masterNode, checked = masterNode.prop("checked");
                if (checked === attributes.checked) {
                }
                instance.check(checked);
                break;
            case "focus":
                //console.log("focus", e);
                instance._updateFocusState(true);
                break;
            case "blur":
                //console.log("blur", e);
                instance._updateFocusState(false);
                break;
            case "keydown":
                //console.log("keydown", e);
                instance._onKeyDown(e);
                break;
            case "keyup":
                //console.log("keyup", e);
                instance._onKeyUp(e);
                break;
        }
    };
    CustomCR.prototype._onTouchEnd = function () {
        this._attributes.touchEnd = true;
    };
    CustomCR.prototype._onRefreshEvent = function (e) {
        e.data.instance.refresh();
    };
    CustomCR.CLASS_CHECKBOX = "cr-checkbox";
    CustomCR.CLASS_RADIO = "cr-radio";
    CustomCR.CLASS_CHECKED = "cr-checked";
    CustomCR.CLASS_FALSELY_INPUT = "cr-input";
    CustomCR.CLASS_INPUT = "cr-nativeInput";
    CustomCR.CLASS_LABEL = "cr-label";
    CustomCR.CLASS_WRAPPER = "cr-container";
    CustomCR.CLASS_FOCUS = "cr-focus";
    CustomCR.CLASS_ACTIVE = "cr-active";
    CustomCR.CLASS_DISABLED = "cr-disabled";
    CustomCR.CLASS_HOVER = "cr-hover";
    CustomCR.EVENT_CHANGE = "crchange";
    CustomCR.EVENT_DISABLED = "crdisable";
    CustomCR.EVENT_REFRESH = "crrefresh";
    CustomCR.EVENT_NAMESPACE = ".customcr";
    //defaults params
    CustomCR._DEFAULTS = {
        wrap: false,
        disabled: false
    };
    return CustomCR;
})();
//# sourceMappingURL=CustomCR.js.map