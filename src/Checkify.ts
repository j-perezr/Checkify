/// <reference path="../external/jquery.d.ts" />
"use strict";

interface CheckifyParams {
    masterNode:JQuery;
    checked? : boolean;
    wrap? : any;
    cssClass? : string;
    classInput? : string;
    classFalselyInput? : string;
    classCheckbox? : string;
    classRadio? : string;
    classChecked? : string;
    classActive? : string;
    classDisabled?: string;
    classWrapper? : string;
    classHover? : string;
    classFocus? : string;
    classLabel? : string;
    disabled? : boolean;
    controls? : string|JQuery;
    controlsAction : string;
    $controls : JQuery;
    $controlsFormControl: JQuery;
    onChange? ();
    onDisable? ();
}
interface CheckifyAttributes extends CheckifyParams {
    wrapper? :JQuery;
    touchEnd? : boolean;
    keyDown? : boolean;
    falselyInput : JQuery;
    label : JQuery;
    type : string;
    ignoreChangeEvent? : boolean;
    ignoreMasterChange : boolean;
    ignoreSlaveChange: boolean;
    slavesChecked : number;
    slavesDisabled : number;
    controlsACtion:string;
}

/**
 * @class
 * @description Javascript UI component for customize checkbox and radio buttons.
 * This script create some markdown and synchronize them with the native input.
 * @use JQuery
 */
class Checkify {
    static VERSION = "0.1.2";
    static CLASS_CHECKBOX = "ch-checkbox";
    static CLASS_RADIO = "ch-radio";
    static CLASS_CHECKED = "ch-checked";
    static CLASS_FALSELY_INPUT = "ch-input";
    static CLASS_INPUT = "ch-nativeInput";
    static CLASS_LABEL = "ch-label";
    static CLASS_WRAPPER = "ch-container";
    static CLASS_FOCUS = "ch-focus";
    static CLASS_ACTIVE = "ch-active";
    static CLASS_DISABLED = "ch-disabled";
    static CLASS_HOVER = "ch-hover";
    static EVENT_CHANGE = "checkify:change";
    static EVENT_CREATE = "checkify:create";
    static EVENT_DISABLED = "checkify:disable";
    static EVENT_REFRESH = "checkify:refresh";
    static EVENT_NAMESPACE = ".checkify";
    //defaults params
    private static _DEFAULTS = {
        wrap: false,
        disabled: false,
        controlsAction:"enable"
    };
    private _attributes:CheckifyAttributes;

    /**
     * @description Javascript component for customize inputs type checkbox and radiobutton. This component create a falsely input with markup and synchronize the states.
     * It's compatible with touch screen and accessible.
     * The component use the interaction with the native input, screan readers interact with the native input.
     * @param   {JQuery}            elem                        Input native to customize.
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
     * @param   {function}          [params.onCreate]              Event handler for crcreate event. Event triggered after finish the initialization
     * @param   {function}          [params.onChange]              Event handler for crchange event. It's the same that $(selectorOfInput).on("checkify:change",function);
     * @param   {function}          [params.onDisable]             Event handler for crdisable event. It's the same that $(selectorOfInput).on("checkify:disable",function);
     * @constructor
     */
    constructor(elem:JQuery,params:CheckifyParams) {
        //get input
        var _attributes,
            masterNode = $(elem),
            inputType:string,
            falselyInput:JQuery,
            wrapper:JQuery,
            label:JQuery,
            disabled:boolean,
            checked:boolean,
            mergedParams;
        if(masterNode.is(":checkbox") || masterNode.is(":radio")) {
            //merge params and data-* _attributes
            mergedParams = $.extend({}, params, Checkify._extractDataAttributes(masterNode));
            //merge params and defaults
            _attributes = $.extend({}, Checkify._DEFAULTS, mergedParams);
            this._attributes = _attributes;
            _attributes.disabled = false;
            _attributes.slavesDisabled = 0;
            _attributes.slavesChecked = 0;
            _attributes.ignoreMasterChange = false;
            _attributes.ignoreSlaveChange = false;
            //init vars
            _attributes.$controls = _attributes.$controls || $();
            _attributes.$controlsFormControl = _attributes.$controlsFormControl || $();
            //prepare native input
            masterNode = $(masterNode);
            //masterNode is the native input
            inputType = masterNode.attr("type");
            //find associated label
            label = $('label[for=' + masterNode.attr("id") + ']');
            //create falsely input
            falselyInput = this._createFalseInput(inputType)
                .attr("role", inputType);
            //insert falsely input and append native input into falselyInput
            falselyInput.insertAfter(masterNode)
                .append(masterNode);
            //if wrap
            if (_attributes.wrap !== false) {
                wrapper = this._createWrapper();
                if (label.length > 0) {
                    wrapper.insertAfter(label);
                    if (label.children(falselyInput).length > 0) {
                        wrapper.append(label);
                    } else {
                        wrapper.append(label);
                        wrapper.append(falselyInput);
                    }
                } else {
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
            this.addToControl(_attributes.controls);
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
        }else{
            throw "Checkify: Invalid element. Only input type checkbox and radio are allowed";
        }
    }
    private _onSlaveDisableStateChange (e: Event,instance: Checkify, disabled: boolean):void{
        if(disabled === true){
            this._attributes.slavesDisabled++;
        }else{
            this._attributes.slavesDisabled--;
        }
    }
    private _onSlaveChange  (e: any):void{
        var instance = e.data.instance,
            _attributes = instance._attributes;
        //update num of slaves checked
        if(this.checked === true) {
            _attributes.slavesChecked++;
        }else{
            _attributes.slavesChecked--;
        }
        //if the change of the master shoudn't be ignored
        if(_attributes.ignoreMasterChange!==true){
            // check the slaves checked and disabled
            if((_attributes.slavesChecked + _attributes.slavesDisabled) == _attributes.$controls.length){
                _attributes.ignoreSlaveChange = true;
                instance.check(true);
                _attributes.ignoreSlaveChange = false;
            }else{
                //if the master is checked
                if(instance.check() === true){
                    _attributes.ignoreSlaveChange = true;
                    instance.check(false);
                    _attributes.ignoreSlaveChange = false;
                }
            }
        }
    }

    public addToControl (elems: string|JQuery){
        //If the param is a query
        if (elems != null) {
            if(typeof elems === "string"){
                //Split in order to extract queries
                var elemsQuery:string[] = (<string>elems).split(" ");
                //Store queries
                this._attributes.controls = this._attributes.controls.concat(" ",elemsQuery.join());
                //for each query
                for (var queryIndex = 0, elemsQueryLength = elemsQuery.length; queryIndex < elemsQueryLength; queryIndex++) {
                    var currentQuery = elemsQuery[queryIndex],
                    items : JQuery;
                    //Find checkify: keyword to identify checkify groups
                    if(currentQuery.search("checkify:")!==-1){
                        //find items of the group
                        items = $("[data-checkify-group='"+currentQuery.replace("checkify:","")+"']");
                    }else{
                        //if string doesn't contains checkify: keyword
                        items = $(currentQuery);
                    }
                    //recursi
                    this.addToControl(items);
                }
            }else{
                var $controls = this._attributes.$controls,
                    $controlsFormControl = this._attributes.$controlsFormControl;
                for (var elemsIndex = 0, elemsLength = elems.length; elemsIndex < elemsLength; elemsIndex++) {
                    var currentElem = $(elems[elemsIndex]);
                    //if the slave isn't registered yet
                    //if slave is a checkbox or radio input
                    if(currentElem.is(":checkbox") || currentElem.is(":radio")) {
                        if ($controls.index(currentElem) === -1) {
                            //check states
                            if (currentElem.prop("checked") === true) {
                                this._attributes.slavesChecked++;
                            }
                            if (currentElem.prop("disabled") === true) {
                                this._attributes.slavesDisabled++;
                            }
                            //register slave
                            currentElem.on("change" + ".slave", {instance: this}, this._onSlaveChange);
                            $.merge($controls,currentElem);
                        }
                    }else if((currentElem.is("input") || currentElem.is("select")) && $controlsFormControl.index(currentElem) === -1){
                        $.merge($controlsFormControl,(currentElem));
                    }
                }
            }
        }
    }
    public removeOfControl (elems: string|JQuery){
        //If the param is a query
        if (elems != null) {
            if(typeof elems === "string"){
                //Split in order to extract queries
                var elemsQuery:string[] = (<string>elems).split(" ");
                //Store queries
                this._attributes.controls = this._attributes.controls.replace(","+elemsQuery.join(),"");
                //for each query
                for (var queryIndex = 0, elemsQueryLength = elemsQuery.length; queryIndex < elemsQueryLength; queryIndex++) {
                    var currentQuery = elemsQuery[queryIndex],
                        items : JQuery;
                    //Find checkify: keyword to identify checkify groups
                    if(currentQuery.search("checkify:")!==-1){
                        //find items of the group
                        items = $("[data-checkify-group='"+currentQuery.replace("checkify:","")+"']");
                    }else{
                        //if string doesn't contains checkify: keyword
                        items = $(currentQuery);
                    }
                    //recursi
                    this.removeOfControl(items);
                }
            }else{
                var $controls = this._attributes.$controls,
                    $controlsFormControl = this._attributes.$controlsFormControl;
                for (var elemsIndex = 0, elemsLength = elems.length; elemsIndex < elemsLength; elemsIndex++) {
                    var currentElem = $(elems[elemsIndex]);
                    //if the slave isn't registered yet
                    //if slave is a checkbox or radio input
                    if(currentElem.is(":checkbox") || currentElem.is(":radio")) {
                        if ($controls.index(currentElem) !== -1) {
                            //check states
                            if (currentElem.prop("checked") === true) {
                                this._attributes.slavesChecked--;
                            }
                            if (currentElem.prop("disabled") === true) {
                                this._attributes.slavesDisabled--;
                            }
                            //register slave
                            currentElem.off("change" + ".slave");
                            $controls.splice($controls.index(currentElem),1);
                        }
                    }else if((currentElem.is("input") || currentElem.is("select")) && $controlsFormControl.index(currentElem) === -1){
                        $controlsFormControl.splice($controlsFormControl.index(currentElem));
                    }
                }
            }
        }
    }
    /**
     * @description Event assignment
     * @private
     */
    private _assignEvents():void {
        var _attributes = this._attributes,
            falselyInput = _attributes.falselyInput,
            masterNode = _attributes.masterNode,
            label = _attributes.label,
            assignEventsToFalselyInput = false;
        //masterNode.on("click"+this.EVENT_NAMESPACE,this._preventDefault);
        masterNode.on("click" + Checkify.EVENT_NAMESPACE +
            " change" + Checkify.EVENT_NAMESPACE +
            " focus" + Checkify.EVENT_NAMESPACE +
            " blur" + Checkify.EVENT_NAMESPACE +
            " keydown" + Checkify.EVENT_NAMESPACE +
            " keyup" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
        masterNode.on(Checkify.EVENT_REFRESH + Checkify.EVENT_NAMESPACE, {instance: this}, this._onRefreshEvent);
        //if label exists, assign events for mouse and touch (hover, active, focus)
        if (label) {
            label.on("touchstart" + Checkify.EVENT_NAMESPACE +
                " touchend" + Checkify.EVENT_NAMESPACE +
                " mousedown" + Checkify.EVENT_NAMESPACE +
                " mouseup" + Checkify.EVENT_NAMESPACE +
                " mouseover" + Checkify.EVENT_NAMESPACE +
                " mouseout" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
            //if the label is the parent of falselyInput, assign click event to the label
            if (falselyInput.parents("label").length === 0) {
                assignEventsToFalselyInput = true;
            }
        }
        //if the label is the parent of falselyInput, is not necessary assign events to the falselyInput because mouse and touch events always be triggered on label. This improve event management
        if (assignEventsToFalselyInput === true) {
            falselyInput.on("click" + Checkify.EVENT_NAMESPACE +
                " touchstart" + Checkify.EVENT_NAMESPACE +
                " touchend" + Checkify.EVENT_NAMESPACE +
                " mousedown" + Checkify.EVENT_NAMESPACE +
                " mouseup" + Checkify.EVENT_NAMESPACE +
                " mouseover" + Checkify.EVENT_NAMESPACE +
                " mouseout" + Checkify.EVENT_NAMESPACE, {instance: this}, this._onEventTriggered);
        }
    }

    /**
     * @description Set or get the checked state of the component.
     * If isChecked argument is passed, the component will be changed to isChecked state.
     * If isChecked argument isn't passed, return the current checked state.
     * @param {boolean}     [isChecked]       New checked state. If true, the component and the input will be checked. If false, the component and the input will be unchecked.
     * @fires Checkify#crchange
     * @returns {boolean}
     */

    check(isChecked?:boolean):boolean {
        if (isChecked !== undefined) {
            if (this._attributes.checked !== isChecked) {
                this._setChecked(isChecked);
            }
        } else {
            return this._attributes.checked;
        }
    }

    /**
     * @description Refresh checked and disabled states if the attr disabled or checked property of the input was changed
     */
    refresh():void {
        var _attributes = this._attributes,
            masterNode = _attributes.masterNode,
            disabled = masterNode.attr("disabled") !== undefined,
            checked = masterNode.attr("checked") !== undefined;
        if(checked === _attributes.checked){
            checked = masterNode.prop("checked");
        }
        if(disabled === _attributes.disabled){
            disabled = masterNode.prop("disabled");
        }
        this.check(checked);
        this.disable(disabled);
    }

    /**
     * @description Toggle the checked state of the component.
     */
    toggle():void {
        this.check(!this._attributes.checked);
    }

    /**
     * @description Set or get the disabled property of the component.
     * If isDisabled argument is passed, the component will be changed to isDisabled state.
     * If isDisabled argument isn't passed, return the current disable state.
     * @param isDisabled
     */
    disable(isDisabled:boolean):boolean {
        var _attributes = this._attributes,
            masterNode = _attributes.masterNode;
        if (isDisabled !== undefined) {
            if (_attributes.disabled !== isDisabled || masterNode.prop("disabled") !== _attributes.disabled) {
                masterNode.prop("disabled", isDisabled);
                this._updateState(isDisabled, (_attributes.classDisabled || Checkify.CLASS_DISABLED));
                if (isDisabled) {
                    masterNode.attr("disabled", "disabled");
                } else {
                    masterNode.removeAttr("disabled");
                }
                _attributes.disabled = isDisabled;
            }
        } else {
            return this._attributes.disabled;
        }
    }

    private destroy() {

    }

    /**
     * @description Add the necessary classes to the markup
     * @private
     */
    private _addCssClasses():void {
        var _attributes = this._attributes,
            masterNode = _attributes.masterNode,
            label = _attributes.label,
            falselyInput = _attributes.falselyInput,
            wrapper = _attributes.wrapper;

        masterNode.addClass((_attributes.classInput || Checkify.CLASS_INPUT));
        falselyInput.addClass((_attributes.classFalselyInput || Checkify.CLASS_FALSELY_INPUT) + " " + (_attributes.type === "checkbox" ? (_attributes.classCheckbox || Checkify.CLASS_CHECKBOX) : (_attributes.classRadio || Checkify.CLASS_RADIO)));
        if (label) {
            label.addClass((_attributes.classLabel || Checkify.CLASS_LABEL));
        }
        if (wrapper) {
            wrapper.addClass((typeof _attributes.wrap) === "string" ? _attributes.wrap : Checkify.CLASS_WRAPPER);
        }
    }

    /**
     * @description Create markup for the wrapper
     * @returns {jQuery}
     * @protected
     */
    private _createWrapper():JQuery {
        return $("<div></div>");
    }

    /**
     * @description Create markup for the falsely input
     * @returns {jQuery}
     * @protected
     */
    private _createFalseInput(type:string):JQuery {
        return $("<i></i>");
    }

    /**
     * @description Extract and normalize data-checkify-* _attributes from a element.
     * @param {jQuery} masterNode Element to extract _attributes
     * @returns {JSON}
     * @see http://api.jquery.com/jquery.data/
     * @private
     */
    private static _extractDataAttributes(masterNode):CheckifyParams {
        //extract data-_attributes
        var params = masterNode.data();
        var parsedParams = <CheckifyParams> {};
        for (var key in params) {
            var parsedKey = key.replace("checkify", "");
            parsedKey = parsedKey.charAt(0).toLowerCase().concat(parsedKey.substring(1));
            parsedParams[parsedKey] = params[key];
        }
        if ("classWrapper" in parsedParams) {
            parsedParams["wrap"] =  parsedParams["classWrapper"];
        }
        return parsedParams;
    }

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
    private _updateSlaves (checked):void{
        var _attributes = this._attributes;
        if (_attributes.ignoreSlaveChange !== true) {
            _attributes.ignoreMasterChange = true;
            var slaves = _attributes.$controls;
            for (var slaveIndex = 0, slavesLength = slaves.length; slaveIndex < slavesLength; slaveIndex++) {
                var currentSlave = $(slaves[slaveIndex]);
                if(currentSlave.data("Checkify") !== undefined) {
                    currentSlave.checkify("check", checked);
                }
            }
            _attributes.ignoreMasterChange = false;

        }
        if(checked === true){
            switch(_attributes.controlsAction){
                case "disable":
                    _attributes.$controlsFormControl.attr("disabled","disabled");
                    break;
                case "enable":
                    _attributes.$controlsFormControl.removeAttr("disabled");
                    break;
                case "hide":
                    _attributes.$controlsFormControl.hide();
                    break;
                case "show":
                    _attributes.$controlsFormControl.show();
                    break;
            }
        }else{
            switch(_attributes.controlsAction){
                case "disable":
                    _attributes.$controlsFormControl.removeAttr("disabled");
                    break;
                case "enable":
                    _attributes.$controlsFormControl.attr("disabled","disabled");
                    break;
                case "hide":
                    _attributes.$controlsFormControl.show();
                    break;
                case "show":
                    _attributes.$controlsFormControl.hide();
                    break;
            }
        }
    }
    private _setChecked(checked:boolean):void {
        var _attributes = this._attributes,
            masterNode = _attributes.masterNode,
            currentChecked = masterNode.prop("checked"),
            slaves;
        if (_attributes.disabled === false) {
            _attributes.checked = checked;
            //update classes
            this._updateState(checked, (_attributes.classChecked || Checkify.CLASS_CHECKED));
            //update aria state
            _attributes.falselyInput.attr("aria-checked", checked);
            //update checked attribute
            if (checked === true) {
                masterNode.attr("checked", "checked");
            } else {
                masterNode.removeAttr("checked");
            }
            masterNode.prop("checked", checked);
            this._updateSlaves(checked);
            //if the property checked isn't equal to the new checked state, update the property and fire native change
            if (currentChecked !== checked) {
                //prevent infinite loops
                _attributes.ignoreChangeEvent = true;
                masterNode.trigger(Checkify.EVENT_CHANGE,[this,_attributes.checked]);
                masterNode.trigger("change");
            }

            //if type is radio, refresh the radios of the same group
            if (_attributes.type === "radio") {
                if(checked === true){
                    masterNode.trigger(Checkify.EVENT_CHANGE,[this,_attributes.checked]);
                    $("[name='" + masterNode.attr("name") + "']").not(masterNode).trigger(Checkify.EVENT_REFRESH);
                }
            }
        }
    }
    /**
     * @description Update the css class of the markup
     * @param {boolean}     state       If true, css classes will be added. If false, css classes will be removed
     * @param {String}      cssClass    Css classes to add o remove.
     * @private
     */
    private _updateState(state:boolean, cssClass:string):void {
        var _attributes = this._attributes;
        if (_attributes.disabled === false || _attributes.masterNode.attr("disabled") === undefined) {
            if (state === true) {
                _attributes.falselyInput.addClass(cssClass);
                _attributes.label.addClass(cssClass);
                if (_attributes.wrapper) {
                    _attributes.wrapper.addClass(cssClass);
                }
            } else {
                _attributes.falselyInput.removeClass(cssClass);
                _attributes.label.removeClass(cssClass);
                if (_attributes.wrapper) {
                    _attributes.wrapper.removeClass(cssClass);
                }
            }
        }
    }

    private _updateHoverState(isHover:boolean):void {
        this._updateState(isHover, (this._attributes.classHover || Checkify.CLASS_HOVER));
    }

    private _updateActiveState(isActive:boolean):void {
        this._updateState(isActive, (this._attributes.classActive || Checkify.CLASS_ACTIVE));
    }

    private _updateFocusState(hasFocus:boolean):void {
        this._updateState(hasFocus, (this._attributes.classFocus || Checkify.CLASS_FOCUS));
    }

    private _onMouseOver():void {
        if (this._attributes.touchEnd !== true) {
            this._updateHoverState(true);
        } else {
            this._attributes.touchEnd = false;
        }
    }

    private _onKeyDown(e:KeyboardEvent):void {
        //control too much events
        if (this._attributes.keyDown !== true) {
            this._attributes.keyDown = true;
            if (e.keyCode === 13 || e.keyCode === 32) {
                this._updateActiveState(true);
            }
        }
    }

    private _onKeyUp(e:KeyboardEvent):void {
        this._attributes.keyDown = false;
        if (e.keyCode === 13 || e.keyCode === 32) {
            this._updateActiveState(false);
        }
    }

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
    private _onEventTriggered(e:JQueryEventObject) {
        var data = e.data,
            instance = data.instance,
            type = e.type;
        switch (type) {
            case "click":
                //console.log("click", e);
                var target = e.target,
                    _attributes = instance._attributes,
                    masterNode = _attributes.masterNode;
                if (target === _attributes.falselyInput.get(0) && _attributes.ignoreChangeEvent !== true) {
                    if (_attributes.type !== "radio" || masterNode.prop("checked") === false) {
                        instance.check(!masterNode.prop("checked"));
                    }
                } else if (target === masterNode.get(0)) {
                    /*by default, the native input is inside of the custom input, if the native input has position and opacity and it's clicked,
                     *the click event is propagated up to the custom input and cause double event. In order to avoid this, when the native input trigger a click event,
                     *the propagation is canceled.
                     *This also control the propagation when native input is child of label (when label is clicked the native input trigger change)*/
                    e.stopPropagation();
                    _attributes.ignoreChangeEvent = false;
                }
                break;
            case "touchstart":
                //console.log("touchstart", e);
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
                var _attributes = instance._attributes,
                    masterNode = _attributes.masterNode,
                    checked = masterNode.prop("checked");
                /*if (checked ===_attributes.checked) {
                    //checked = masterNode.attr("checked") === undefined ? false : true;
                }
                 instance.check(checked);*/
                if (_attributes.ignoreChangeEvent !== true) {
                    //if native input trigger check and isn't triggered by the component check for checked state
                    // first check the property checked
                    // if the property checked is the same that the checked attribute of the component
                    // check the attribute checked
                    var _attributes = instance._attributes,
                        masterNode = _attributes.masterNode,
                        checked = masterNode.prop("checked");
                    if (checked === _attributes.checked) {
                        checked = masterNode.attr("checked") === undefined ? false : true;
                    }
                    instance.check(checked);
                } else {
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
    }

    private _onTouchEnd():void {
        this._attributes.touchEnd = true;
    }

    private _onRefreshEvent(e:JQueryEventObject):void {
        e.data.instance.refresh();
    }
}
//Based on jquery widget integration
$.fn.checkify = function (options) {
    var isMethodCall = typeof options === "string",
        args = Array.prototype.slice.call(arguments, 1);

    var stack = [];
    if (isMethodCall) {
        this.each(function () {
            var methodValue,
                instance = $(this).data("Checkify");
            if (options === "instance") {
                stack.push(instance);
            } else {
                if (!instance) {
                    return $.error("cannot call methods on Checkify prior to initialization; " +
                        "attempted to call method '" + options + "'");
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    return $.error("no such method '" + options + "' for Checkify instance");
                }
                if (options == "destroy") {
                    $(this).data("Checkify", null);
                }
                methodValue = instance[options].apply(instance, args);
                if (methodValue !== instance && methodValue !== undefined) {
                    stack.push(methodValue);
                }
            }
        });
    } else {

        this.each(function () {
            var instance = $(this).data("Checkify");
            if (instance == undefined) {
                options = options || {};
                instance = new Checkify(this,options);
                $(this).data("Checkify", instance);
                stack.push(instance);
            }
        });
    }

    return stack.length === 1 ? stack[0] : stack;
};