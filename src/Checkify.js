/// <reference path="../external/jquery.d.ts" />
"use strict";
/**
 * @class
 * @description Javascript UI component for customize checkbox and radio buttons.
 * This script create some markdown and synchronize them with the native input.
 * @use JQuery
 */
var Checkify = (function () {
    /**
     * @description Javascript component for customize inputs type checkbox and radiobutton. This component create a falsely input with markup and synchronize the states.
     * It's compatible with touch screen and accessible.
     * The component use the interaction with the native input, screan readers interact with the native input.     *
     * @param   {json}              params                      Params for the component. All the parameters except listed below (except callbacks) could be indicated by data-checkify-* _attributes on native input. Like &gt;input data-checkify-checked="true">
     *                                                          <p>NOTE: All the uppercase letters will be preceded by - in data-checkify- _attributes.</p>
     *                                                          <p>For example, for the attribute classInput you have to use &gt;input data-checkify-class-input="classToAddToTheInput"></p>
     * @param   {(boolean|String)}    [params.wrap=false]       If true, the native input, falsely input and the label associated to the native input will be wrapped into a container.
     *                                                          <p>Also it's possible pass a String. The string will be added as css class for the wrapper</p>
     *                                                          <p>For set this parameter by data-checkify- you have to use data-checkify-wrapper="true" to add the wrapper</p>
     *                                                          <p>For set class by data-checkify- you have to use data-checkify-wrapper="classesToAdd".</p>
     *                                                          <br>The container is created with the _createWrapper function. This function could be overwrite.
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
     *                                                              <li>By data-checkify-disabled attribute on native input</li>
     *                                                              <li>By disabled attribute on native input</li>
     *                                                          </ul>
     *  @param   {boolean}           [params.checked=false]     If true, the component will be checked. This parameter could be indicated in three ways (order and priority are the same):
     *                                                          <ul>
     *                                                              <li>By parameter in params</li>
     *                                                              <li>By data-checkify-checked attribute on native input</li>
     *                                                              <li>By checked attribute on native input</li>
     *                                                          </ul>
     * @param   {function}          [params.onChange]              Event handler for crchange event. It's the same that $(selectorOfInput).on("crchange",function);
     * @param   {function}          [params.onDisable]             Event handler for crdisable event. It's the same that $(selectorOfInput).on("crdisable",function);
     * @constructor
     */
    function Checkify(params) {
        //get input
        var _attributes, masterNode = params.masterNode, inputType, falselyInput, wrapper, label, disabled, checked, mergedParams;
        //merge params and data-* _attributes
        mergedParams = $.extend({}, params, Checkify._extractDataAttributes(masterNode));
        //merge params and defaults
        _attributes = $.extend({}, Checkify._DEFAULTS, mergedParams);
        this._attributes = _attributes;
        _attributes.disabled = false;
        //prepare native input
        masterNode = $(masterNode);
        //masterNode is the native input
        inputType = masterNode.attr("type");
        //find associated label
        label = $('label[for=' + masterNode.attr("id") + ']');
        //create falsely input
        falselyInput = this._createFalseInput(inputType).attr("role", inputType);
        //insert falsely input and append native input into falselyInput
        falselyInput.insertAfter(masterNode).append(masterNode);
        //if wrap
        if (_attributes.wrap !== false) {
            wrapper = this._createWrapper();
            if (label.length > 0) {
                wrapper.insertAfter(label);
                if (label.children(falselyInput).length > 0) {
                    wrapper.append(label);
                }
                else {
                    wrapper.append(label);
                    wrapper.append(falselyInput);
                }
            }
            else {
                wrapper.insertAfter(falselyInput);
                wrapper.append(falselyInput);
            }
            _attributes.wrapper = wrapper;
        }
        //add classes to the markup
        _attributes.masterNode = masterNode;
        _attributes.type = inputType;
        _attributes.label = label;
        _attributes.falselyInput = falselyInput;
        //add css classes
        this._addCssClasses();
        //update checked state. If params didn't have checked attribute, component find native input state
        this._assignEvents();
        checked = _attributes.checked !== undefined ? _attributes.checked : masterNode.attr("checked") !== undefined ? true : masterNode.prop("checked");
        this._setChecked(checked);
        //update disabled state. If params didn't have checked attribute, component find native input state
        disabled = mergedParams.disabled !== undefined ? mergedParams.disabled : masterNode.attr("disabled") !== undefined ? true : masterNode.prop("disabled");
        this.disable(disabled);
        //asign internal events
        masterNode.data("Checkify", this);
        //add callbacks
        if (_attributes.onChange) {
            masterNode.on("crchange", _attributes.onChange);
            _attributes.onChange = null;
            delete _attributes.onChange;
        }
        if (_attributes.onDisabled) {
            masterNode.on("crdisabled", _attributes.onDisabled);
            _attributes.onDisabled = null;
            delete _attributes.onDisabled;
        }
    }
    /**
     * @description Event assignment
     * @private
     */
    Checkify.prototype._assignEvents = function () {
        var _attributes = this._attributes, falselyInput = _attributes.falselyInput, masterNode = _attributes.masterNode, label = _attributes.label, assignEventsToFalselyInput = false;
        //masterNode.on("click"+this.EVENT_NAMESPACE,this._preventDefault);
        masterNode.on("click" + Checkify.EVENT_NAMESPACE + " change" + Checkify.EVENT_NAMESPACE + " focus" + Checkify.EVENT_NAMESPACE + " blur" + Checkify.EVENT_NAMESPACE + " keydown" + Checkify.EVENT_NAMESPACE + " keyup" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
        masterNode.on(Checkify.EVENT_REFRESH + Checkify.EVENT_NAMESPACE, {instance: this}, this._onRefreshEvent);
        //if label exists, assign events for mouse and touch (hover, active, focus)
        if (label) {
            label.on("touchstart" + Checkify.EVENT_NAMESPACE + " touchend" + Checkify.EVENT_NAMESPACE + " mousedown" + Checkify.EVENT_NAMESPACE + " mouseup" + Checkify.EVENT_NAMESPACE + " mouseover" + Checkify.EVENT_NAMESPACE + " mouseout" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
            //if the label is the parent of falselyInput, assign click event to the label
            if (falselyInput.parents("label").length === 0) {
                assignEventsToFalselyInput = true;
            }
        }
        //if the label is the parent of falselyInput, is not necessary assign events to the falselyInput because mouse and touch events always be triggered on label. This improve event management
        if (assignEventsToFalselyInput === true) {
            falselyInput.on("click" + Checkify.EVENT_NAMESPACE + " touchstart" + Checkify.EVENT_NAMESPACE + " touchend" + Checkify.EVENT_NAMESPACE + " mousedown" + Checkify.EVENT_NAMESPACE + " mouseup" + Checkify.EVENT_NAMESPACE + " mouseover" + Checkify.EVENT_NAMESPACE + " mouseout" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
        }
    };
    /**
     * @description Set or get the checked state of the component.
     * If isChecked argument is passed, the component will be changed to isChecked state.
     * If isChecked argument isn't passed, return the current checked state.
     * @param {boolean}     [isChecked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
     * @fires Checkify#crchange
     * @returns {boolean}
     */
    Checkify.prototype.check = function (isChecked) {
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
    Checkify.prototype.refresh = function () {
        var _attributes = this._attributes, masterNode = _attributes.masterNode, disabled = masterNode.attr("disabled") !== undefined, checked = masterNode.attr("checked") !== undefined;
        if (checked === _attributes.checked) {
            checked = masterNode.prop("checked");
        }
        if (disabled === _attributes.disabled) {
            disabled = masterNode.prop("disabled");
        }
        this.check(checked);
        this.disable(disabled);
    };
    /**
     * @description Toggle the checked state of the component.
     */
    Checkify.prototype.toggle = function () {
        this.check(!this._attributes.checked);
    };
    /**
     * @description Set or get the disabled property of the component.
     * If isDisabled argument is passed, the component will be changed to isDisabled state.
     * If isDisabled argument isn't passed, return the current disable state.
     * @param isDisabled
     */
    Checkify.prototype.disable = function (isDisabled) {
        var _attributes = this._attributes, masterNode = _attributes.masterNode;
        if (isDisabled !== undefined) {
            if (_attributes.disabled !== isDisabled || masterNode.prop("disabled") !== _attributes.disabled) {
                masterNode.prop("disabled", isDisabled);
                this._updateState(isDisabled, (_attributes.classDisabled || Checkify.CLASS_DISABLED));
                if (isDisabled) {
                    masterNode.attr("disabled", "disabled");
                }
                else {
                    masterNode.removeAttr("disabled");
                }
                _attributes.disabled = isDisabled;
            }
        }
        else {
            return this._attributes.disabled;
        }
    };
    Checkify.prototype.destroy = function () {
    };
    /**
     * @description Add the necessary classes to the markup
     * @private
     */
    Checkify.prototype._addCssClasses = function () {
        var _attributes = this._attributes, masterNode = _attributes.masterNode, label = _attributes.label, falselyInput = _attributes.falselyInput, wrapper = _attributes.wrapper;
        masterNode.addClass((_attributes.classInput || Checkify.CLASS_INPUT));
        falselyInput.addClass((_attributes.classFalselyInput || Checkify.CLASS_FALSELY_INPUT) + " " + (_attributes.type === "checkbox" ? (_attributes.classCheckbox || Checkify.CLASS_CHECKBOX) : (_attributes.classRadio || Checkify.CLASS_RADIO)));
        if (label) {
            label.addClass((_attributes.classLabel || Checkify.CLASS_LABEL));
        }
        if (wrapper) {
            wrapper.addClass((typeof _attributes.wrap) === "string" ? _attributes.wrap : Checkify.CLASS_WRAPPER);
        }
    };
    /**
     * @description Create markup for the wrapper
     * @returns {jQuery}
     * @protected
     */
    Checkify.prototype._createWrapper = function () {
        return $("<div></div>");
    };
    /**
     * @description Create markup for the falsely input
     * @returns {jQuery}
     * @protected
     */
    Checkify.prototype._createFalseInput = function (type) {
        return $("<i></i>");
    };
    /**
     * @description Extract and normalize data-checkify-* _attributes from a element.
     * @param {jQuery} masterNode Element to extract _attributes
     * @returns {JSON}
     * @see http://api.jquery.com/jquery.data/
     * @private
     */
    Checkify._extractDataAttributes = function (masterNode) {
        //extract data-_attributes
        var params = masterNode.data();
        var parsedParams = {};
        for (var key in params) {
            var parsedKey = key.replace("checkify", "");
            parsedKey = parsedKey.charAt(0).toLowerCase().concat(parsedKey.substring(1));
            parsedParams[parsedKey] = params[key];
        }
        if ("classWrapper" in parsedParams) {
            parsedParams["wrap"] = parsedParams["classWrapper"];
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
    /*private _setChecked(checked:boolean):void {
        var attributes = this._attributes,
            masterNode = attributes.masterNode,
            currentChecked = masterNode.prop("checked");
        if (attributes.disabled === false) {
            if (checked === currentChecked) {
                attributes.checked = currentChecked;
                //update classes
     this._updateState(checked, (attributes.classChecked || Checkify.CLASS_CHECKED));
                //update aria state
                //if type is radio, refresh the radios of the same group
                attributes.falselyInput.attr("aria-checked", checked);
     if(checked === true){
     masterNode.attr("checked","checked");
     }else{
     masterNode.removeAttr("checked");
     }
                if (attributes.type === "radio" && checked === true) {
     $("[name='" + masterNode.attr("name") + "']").not(masterNode).trigger(Checkify.EVENT_REFRESH);
     masterNode.trigger(Checkify.EVENT_CHANGE);
                } else if (attributes.type === "checkbox") {
     masterNode.trigger(Checkify.EVENT_CHANGE);
                }
            } else {
                //If the checked property isn't equal to checked param, request to the input for update
                //It's the input itself the responsible of manage his states
     attributes.ignoreChangeEvent = true;
                masterNode.trigger("click");
     this._setChecked(checked);
            }
        }
     }*/
    Checkify.prototype._setChecked = function (checked) {
        var _attributes = this._attributes, masterNode = _attributes.masterNode, currentChecked = masterNode.prop("checked");
        if (_attributes.disabled === false) {
            _attributes.checked = checked;
            //update classes
            this._updateState(checked, (_attributes.classChecked || Checkify.CLASS_CHECKED));
            //update aria state
            _attributes.falselyInput.attr("aria-checked", checked);
            //update checked attribute
            if (checked === true) {
                masterNode.attr("checked", "checked");
            }
            else {
                masterNode.removeAttr("checked");
            }
            masterNode.prop("checked", checked);
            //if the property checked isn't equal to the new checked state, update the property and fire native change
            if (currentChecked !== checked) {
                //prevent infinite loops
                _attributes.ignoreChangeEvent = true;
                masterNode.trigger("change");
            }
            //if type is radio, refresh the radios of the same group
            if (_attributes.type === "radio" && checked === true) {
                $("[name='" + masterNode.attr("name") + "']").not(masterNode).trigger(Checkify.EVENT_REFRESH);
            }
        }
    };
    /**
     * @description Update the css class of the markup
     * @param {boolean}     state       If true, css classes will be added. If false, css classes will be removed
     * @param {String}      cssClass    Css classes to add o remove.
     * @private
     */
    Checkify.prototype._updateState = function (state, cssClass) {
        var _attributes = this._attributes;
        if (_attributes.disabled === false || _attributes.masterNode.attr("disabled") === undefined) {
            if (state === true) {
                _attributes.falselyInput.addClass(cssClass);
                _attributes.label.addClass(cssClass);
                if (_attributes.wrapper) {
                    _attributes.wrapper.addClass(cssClass);
                }
            }
            else {
                _attributes.falselyInput.removeClass(cssClass);
                _attributes.label.removeClass(cssClass);
                if (_attributes.wrapper) {
                    _attributes.wrapper.removeClass(cssClass);
                }
            }
        }
    };
    Checkify.prototype._updateHoverState = function (isHover) {
        this._updateState(isHover, (this._attributes.classHover || Checkify.CLASS_HOVER));
    };
    Checkify.prototype._updateActiveState = function (isActive) {
        this._updateState(isActive, (this._attributes.classActive || Checkify.CLASS_ACTIVE));
    };
    Checkify.prototype._updateFocusState = function (hasFocus) {
        this._updateState(hasFocus, (this._attributes.classFocus || Checkify.CLASS_FOCUS));
    };
    Checkify.prototype._onMouseOver = function () {
        if (this._attributes.touchEnd !== true) {
            this._updateHoverState(true);
        }
        else {
            this._attributes.touchEnd = false;
        }
    };
    Checkify.prototype._onKeyDown = function (e) {
        //control too much events
        if (this._attributes.keyDown !== true) {
            this._attributes.keyDown = true;
            if (e.keyCode === 13 || e.keyCode === 32) {
                this._updateActiveState(true);
            }
        }
    };
    Checkify.prototype._onKeyUp = function (e) {
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
    Checkify.prototype._onEventTriggered = function (e) {
        var data = e.data, instance = data.instance, type = e.type;
        switch (type) {
            case "click":
                //console.log("click", e);
                var target = e.target, _attributes = instance._attributes, masterNode = _attributes.masterNode;
                if (target === _attributes.falselyInput.get(0) && _attributes.ignoreChangeEvent !== true) {
                    if (_attributes.type !== "radio" || masterNode.prop("checked") === false) {
                        instance.check(!masterNode.prop("checked"));
                    }
                }
                else if (target === masterNode.get(0)) {
                    /*by default, the native input is inside of the custom input, if the native input has position and opacity and it's clicked,
                     *the click event is propagated up to the custom input and cause double event. In order to avoid this, when the native input trigger a click event,
                     *the propagation is canceled.
                     *This also control the propagation when native input is child of label (when label is clicked the native input trigger change)*/
                    e.stopPropagation();
                    _attributes.ignoreChangeEvent = false;
                }
                break;
            case "touchstart":
            case "mousedown":
                //console.log("mousedown", e);
                instance._updateActiveState(true);
                break;
            case "touchend":
                //console.log("touchend", e);
                //control ghost hover in touch screens
                instance._onTouchEnd();
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
                var _attributes = instance._attributes, masterNode = _attributes.masterNode, checked = masterNode.prop("checked");
                /*if (checked ===_attributes.checked) {
                    //checked = masterNode.attr("checked") === undefined ? false : true;
                }
                 instance.check(checked);*/
                if (_attributes.ignoreChangeEvent !== true) {
                    //if native input trigger check and isn't triggered by the component check for checked state
                    // first check the property checked
                    // if the property checked is the same that the checked attribute of the component
                    // check the attribute checked
                    var _attributes = instance._attributes, masterNode = _attributes.masterNode, checked = masterNode.prop("checked");
                    if (checked === _attributes.checked) {
                        checked = masterNode.attr("checked") === undefined ? false : true;
                    }
                    instance.check(checked);
                }
                else {
                    _attributes.ignoreChangeEvent = false;
                }
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
    Checkify.prototype._onTouchEnd = function () {
        this._attributes.touchEnd = true;
    };
    Checkify.prototype._onRefreshEvent = function (e) {
        e.data.instance.refresh();
    };
    Checkify.VERSION = "0.1.2";
    Checkify.CLASS_CHECKBOX = "ch-checkbox";
    Checkify.CLASS_RADIO = "ch-radio";
    Checkify.CLASS_CHECKED = "ch-checked";
    Checkify.CLASS_FALSELY_INPUT = "ch-input";
    Checkify.CLASS_INPUT = "ch-nativeInput";
    Checkify.CLASS_LABEL = "ch-label";
    Checkify.CLASS_WRAPPER = "ch-container";
    Checkify.CLASS_FOCUS = "ch-focus";
    Checkify.CLASS_ACTIVE = "ch-active";
    Checkify.CLASS_DISABLED = "ch-disabled";
    Checkify.CLASS_HOVER = "ch-hover";
    Checkify.EVENT_CHANGE = "checkify:change";
    Checkify.EVENT_DISABLED = "checkify:disable";
    Checkify.EVENT_REFRESH = "checkify:refresh";
    Checkify.EVENT_NAMESPACE = ".checkify";
    //defaults params
    Checkify._DEFAULTS = {
        wrap: false,
        disabled: false
    };
    return Checkify;
})();
//# sourceMappingURL=Checkify.js.map