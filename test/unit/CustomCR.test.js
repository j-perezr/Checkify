describe("CustomCR Test", function () {
    //Loading fixtures for testing
    var f = jasmine.getFixtures();
    f.fixturesPath = 'base';
    f.load('test/unit/CustomCR.test.html');
    //caching chai assert
    var assert = chai.assert;
    var expect = chai.expect;
    describe('1. Initialization', function () {
        //Check parameters config
        describe("1.1. When the component it's initialiced", function () {
            //Test 1.1 - basic init
            var $test1Container = $("#test1Container");
            describe('1.1 Without label', function () {
                var $elem = $test1Container.find("#test11");
                var instance = new CustomCR({
                    masterNode: $elem
                });
                // correct instanciated
                var falselyInput = instance._attributes.falselyInput;
                it('Should not be undefined', function () {
                    expect(instance).not.be.undefined;
                });
                //basic markup created
                it('Should have conainer with css class and role', function () {
                    expect(falselyInput.children().get(0)).to.equal($elem.get(0));
                    expect(falselyInput.hasClass(CustomCR.CLASS_FALSELY_INPUT)).to.be.true;
                    expect(falselyInput.attr("role")).to.equal("checkbox");
                });
                it('Should have a class according to the type', function () {
                    var cssClass = CustomCR.CLASS_CHECKBOX;
                    if ($elem.attr("type") === "Radio") {
                        cssClass = CustomCR.CLASS_RADIO;
                    }
                    expect(falselyInput.hasClass(cssClass)).to.be.true;
                });
                //basic statets ok
                it('Should be enabled and unchecked', function () {
                    expect(instance.disable()).to.be.false;
                    expect($elem.prop("disabled")).to.be.false;
                    expect($elem.attr("disabled")).to.be.undefined;
                    expect(instance.check()).to.be.false;
                    expect(falselyInput.attr("aria-checked")).to.equal("false");
                });
            });

            //Test 1.2 - Basic init with label
            describe('1.2. With label', function () {
                var $elem = $test1Container.find("#test12");
                var instance = new CustomCR({
                    masterNode: $elem
                });
                //label
                var label = $test1Container.find("[for='" + $elem.attr("id") + "']");
                it('The label associated should have a class', function () {
                    expect(label.hasClass(CustomCR.CLASS_LABEL)).to.be.true;
                    expect(label.get(0)).to.equal(instance._attributes.label.get(0));
                });
            });

            //Test 1.3 - Type radio
            describe("1.3. and it's a radio", function () {
                var $elem = $test1Container.find("#test13");
                var instance = new CustomCR({
                    masterNode: $elem
                });
                // correct instanciated
                var falselyInput = instance._attributes.falselyInput;
                it('Should not be undefined', function () {
                    expect(instance).not.be.undefined;
                });
                //basic markup created
                it('Should have conainer with css class and role', function () {
                    expect(falselyInput.children().get(0)).to.equal($elem.get(0));
                    expect(falselyInput.hasClass(CustomCR.CLASS_FALSELY_INPUT)).to.be.true;
                    expect(falselyInput.attr("role")).to.equal("radio");
                });
                it('Should have a class according to the typè', function () {
                    var cssClass = CustomCR.CLASS_CHECKBOX;
                    if ($elem.attr("type") === "radio") {
                        cssClass = CustomCR.CLASS_RADIO;
                    }
                    expect(falselyInput.hasClass(cssClass)).to.be.true;
                });
                //basic statets ok
                it('Should be enabled and unchecked', function () {
                    expect(instance.disable()).to.be.false;
                    expect($elem.prop("disabled")).to.be.false;
                    expect($elem.attr("disabled")).to.be.undefined;
                    expect(instance.check()).to.be.false;
                    expect(falselyInput.attr("aria-checked")).to.equal("false");
                });
            })
            // Test 1.4 - html attributes
            describe("1.4. With disabled and checked attributes", function () {
                var $elem = $test1Container.find("#test14");
                var instance = new CustomCR({
                    masterNode: $elem
                });
                // correct instanciated
                var falselyInput = instance._attributes.falselyInput;
                it("Attribute check should be true in component and prop of input", function () {
                    expect(instance.check()).to.be.true;
                    expect($elem.prop("checked")).to.be.true;
                });
                it("Should have class check", function () {
                    expect(falselyInput.hasClass(CustomCR.CLASS_CHECKED)).to.be.true;
                });
                it("Attribute disabled should be true", function () {
                    expect(instance.disable()).to.be.true;
                });
                it("Property disabled should be true", function () {
                    expect($elem.prop("disabled")).to.be.true;
                });
                it("Couldn't be operated", function () {
                    instance.check(false);
                    expect($elem.prop("checked")).to.be.true;
                    expect(instance.check()).to.be.true;
                });
            });
            //Test 1.5 - html attributes vs params
            describe("1.5. Has html attributes and json params.", function () {
                var $elem = $test1Container.find("#test15");
                var instance = new CustomCR({
                    masterNode: $elem,
                    disabled: false,
                    checked: false
                });
                // correct instanciated
                var falselyInput = instance._attributes.falselyInput;
                it("Attribute check should be false in component and prop of input", function () {
                    expect(instance.check()).to.be.false;
                    expect($elem.prop("checked")).to.be.false;
                });
                it("Shouldn't have class check", function () {
                    expect(falselyInput.hasClass(CustomCR.CLASS_CHECKED)).to.be.false;
                });
                it("Attribute disabled should be false", function () {
                    expect(instance.disable()).to.be.false;
                });
                it("Property disabled should be false", function () {
                    expect($elem.prop("disabled")).to.be.false;
                });
                it("Could be operated", function () {
                    instance.check(true);
                    expect($elem.prop("checked")).to.be.true;
                    expect(instance.check()).to.be.true;
                });
            });
            // Test 1.6, init with data-* attributes checkbox
            describe("1.6. And use data-customcr-* attributes for all (checkbox)", function () {
                var $elem = $test1Container.find("#test16");
                var instance = new CustomCR({
                    masterNode: $elem,
                    disabled: false,
                    checked: false
                });
                it("Should have a wrapper and wrapper should have the data-customcr-wrapper value", function () {
                    expect(instance._attributes).to.include.keys("wrapper");
                    expect(instance._attributes.wrapper.find(instance._attributes.masterNode)).to.have.length.of.at.least(1);
                    expect(instance._attributes.wrapper.hasClass($elem.data("customcrClassWrapper"))).to.be.true;
                });
                it("The native input should have the data-customcr-class-input value", function () {
                    expect($elem.hasClass($elem.data("customcrClassInput"))).to.be.true;
                });
                it("The falsely input should have the data-customcr-class-falsely-input value", function () {
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassFalselyInput"))).to.be.true;
                });
                it("The falsely input of type checkbox should have the data-customcr-class-checkbox value", function () {
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassCheckbox"))).to.be.true;
                });
                it("Should be disabled and should have the data-customcr-class-disabled value", function () {
                    expect(instance.disable()).to.be.true;
                    expect($elem.prop("disabled")).to.be.true;
                    expect($elem.attr("disabled")).not.be.undefined;
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassFalselyInput"))).to.be.true;
                });
                it("Should be checked and should have the data-customcr-class-checked value", function () {
                    expect(instance.check()).to.be.true;
                    expect($elem.prop("checked")).to.be.true;
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassChecked"))).to.be.true;
                });
            });
            // Test 1.7, init with data-* attributes checkbox
            describe("1.7. And use data-customcr-* attributes for all (radio)", function () {
                var $elem = $test1Container.find("#test17");
                var instance = new CustomCR({
                    masterNode: $elem,
                    disabled: false,
                    checked: false
                });
                it("Should have a wrapper and wrapper should have the data-customcr-wrapper value", function () {
                    expect(instance._attributes).to.include.keys("wrapper");
                    expect(instance._attributes.wrapper.find(instance._attributes.masterNode)).to.have.length.of.at.least(1);
                    expect(instance._attributes.wrapper.hasClass($elem.data("customcrClassWrapper"))).to.be.true;
                });
                it("The native input should have the data-customcr-class-input value", function () {
                    expect($elem.hasClass($elem.data("customcrClassInput"))).to.be.true;
                });
                it("The falsely input should have the data-customcr-class-falsely-input value", function () {
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassFalselyInput"))).to.be.true;
                });
                it("The falsely input of type checkbox should have the data-customcr-class-checkbox value", function () {
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassRadio"))).to.be.true;
                });
                it("Should be disabled and should have the data-customcr-class-disabled value", function () {
                    expect(instance.disable()).to.be.true;
                    expect($elem.prop("disabled")).to.be.true;
                    expect($elem.attr("disabled")).not.be.undefined;
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassFalselyInput"))).to.be.true;
                });
                it("Should be checked and should have the data-customcr-class-checked value", function () {
                    expect(instance.check()).to.be.true;
                    expect($elem.prop("checked")).to.be.true;
                    expect(instance._attributes.falselyInput.hasClass($elem.data("customcrClassChecked"))).to.be.true;
                });
            });
            // Wrap configurations
            describe("1.8. And wrap config is boolean",function(){
                var $elem = $test1Container.find("#test18");
                var instance = new CustomCR({
                    masterNode: $elem,
                    wrap:true
                });
                it("Should have wrapper",function(){
                    expect(instance._attributes.wrapper).not.be.undefined;
                    expect(instance._attributes.wrapper.find(instance._attributes.falselyInput)).to.have.length.of.at.least(1);
                })
            });
            describe("1.9. And wrap config is string",function(){
                var $elem = $test1Container.find("#test19");
                var instance = new CustomCR({
                    masterNode: $elem,
                    wrap:"wrapper"
                });
                it("Should have wrapper with the class in the param",function(){
                    expect(instance._attributes.wrapper).not.be.undefined;
                    expect(instance._attributes.wrapper.find(instance._attributes.falselyInput)).to.have.length.of.at.least(1);
                    expect(instance._attributes.wrapper.hasClass("wrapper")).be.true;
                })
            });
        });


    });

    //classes
    //events
    //wrapper
    //wrapper as an object
    //init data-customcr-* attributes
    //checked
    //disabled
    //classes
    describe('2. Functions & methods.', function () {
        var $test2Container = $("#test2Container");
        var $check = $test2Container.find("#test21");
        var instanceCheck = new CustomCR({
            masterNode: $check
        });
        var $radio = $test2Container.find("#test22");
        var instanceRadio = new CustomCR({
            masterNode: $radio
        });
        //Test over check function
        describe('2.1 When check function is invoked without params', function () {
            it('Checkbox should return current check state', function () {
                expect(instanceCheck.check()).be.equal($check.prop('checked'));
            });
            it('Radio should return current check state', function () {
                expect(instanceRadio.check()).be.equal($radio.prop('checked'));
            });
        });
        describe('2.2 When check function is invoked with true param', function () {
            it('Checkbox should update check state and return true', function () {
                instanceCheck.check(true);
                expect(instanceCheck.check()).to.be.true;
                expect($check.prop("checked")).to.be.true;
                expect($check.attr("checked")).not.be.undefined;
                expect(instanceCheck.check()).be.equal($check.prop('checked'));
                expect(instanceCheck._attributes.falselyInput.attr("aria-checked")).be.equal("true");
            });
            it('Radio should update check state and return true', function () {
                instanceRadio.check(true);
                expect(instanceRadio.check()).to.be.true;
                expect($radio.prop("checked")).to.be.true;
                expect($radio.attr("checked")).not.be.undefined;
                expect(instanceRadio.check()).be.equal($radio.prop('checked'));
                expect(instanceRadio._attributes.falselyInput.attr("aria-checked")).be.equal("true");
            });
        });
        describe('2.3 When check function is invoked with false param', function () {
            it('Checkbox should update check state and return false', function () {
                instanceCheck.check(false);
                expect(instanceCheck.check()).to.be.false;
                expect($check.prop("checked")).to.be.false;
                expect($check.attr("checked")).be.undefined;
                expect(instanceCheck.check()).be.equal($check.prop('checked'));
                expect(instanceCheck._attributes.falselyInput.attr("aria-checked")).be.equal("false");
            });
            it('Radio should update check state and return false', function () {
                instanceRadio.check(false);
                expect(instanceRadio.check()).to.be.false;
                expect($radio.prop("checked")).to.be.false;
                expect($radio.attr("checked")).be.undefined;
                expect(instanceRadio.check()).be.equal($radio.prop('checked'));
                expect(instanceRadio._attributes.falselyInput.attr("aria-checked")).be.equal("false");
            });
        });
        // End test over check function
        // Test over disable function
        describe('2.4 When disable function is invoked without params', function () {
            it('Checkbox should return false', function () {
                expect(instanceCheck.disable()).to.be.false;
                expect($check.attr("disabled")).be.undefined;
                instanceCheck.check(true);
                expect(instanceCheck.check()).to.be.true;
                expect($check.prop("checked")).to.be.true;
            });
            it('Radio should return false', function () {
                expect(instanceRadio.disable()).to.be.false;
                expect($radio.attr("disabled")).be.undefined;
                instanceRadio.check(true);
                expect(instanceRadio.check()).to.be.true;
                expect($radio.prop("checked")).to.be.true;
            });
        });
        describe('2.5 When disable function is invoked with true param', function () {
            it("Checkbox should return true and couldn't be operated", function () {
                instanceCheck.disable(true)
                expect(instanceCheck.disable()).to.be.true;
                expect($check.attr("disabled")).not.be.undefined;
                instanceCheck.check(false);
                expect(instanceCheck.check()).to.be.true;
                expect($check.prop("checked")).to.be.true;
            });
            it("Radio should return true and couldn't be operated", function () {
                instanceRadio.disable(true)
                expect(instanceRadio.disable()).to.be.true;
                expect($radio.attr("disabled")).not.be.undefined;
                instanceRadio.check(false);
                expect(instanceRadio.check()).to.be.true;
                expect($radio.prop("checked")).to.be.true;
            });
        });
        describe('2.6 When disable function is invoked with false param', function () {
            it("Checkbox should return true and could be operated", function () {
                instanceCheck.disable(false)
                expect(instanceCheck.disable()).to.be.false;
                expect($check.attr("disabled")).be.undefined;
                instanceCheck.check(false);
                expect(instanceCheck.check()).to.be.false;
                expect($check.prop("checked")).to.be.false;
            });
            it("Radio should return true and could be operated", function () {
                instanceRadio.disable(false)
                expect(instanceRadio.disable()).to.be.false;
                expect($radio.attr("disabled")).be.undefined;
                instanceRadio.check(false);
                expect(instanceRadio.check()).to.be.false;
                expect($radio.prop("checked")).to.be.false;
            });
        });
        // End test over disable function
        // Toggle
        describe('2.7 When toggle function is invoked', function () {
            it("and checkbox is unchecked should change to checked", function () {
                instanceCheck.toggle();
                expect(instanceCheck.check()).to.be.true;
                expect($check.prop("checked")).to.be.true;
                expect($check.attr("checked")).not.be.undefined;
            });
            it("Radio should return true and couldn't be operated", function () {
                instanceRadio.toggle();
                expect(instanceRadio.check()).to.be.true;
                expect($radio.prop("checked")).to.be.true;
                expect($radio.attr("checked")).not.be.undefined;
            });
        });
        //refresh
        describe("2.8 When the native input is modified externaly",function(){
            describe("2.8.1 and checked attribute is modified in checkbox",function(){
                it("checked property should be false",function(){
                    $check.removeAttr("checked");
                    instanceCheck.refresh();
                    expect($check.prop("checked")).to.be.false;
                });
                it("checked attribute should be undefined",function(){
                    expect($check.attr("checked")).be.undefined;
                });
            });
            describe("2.8.2 and checked property is modified in checkbox",function(){
                it("checked attribute should not be undefined",function(){
                    $check.prop("checked",true);
                    instanceCheck.refresh();
                    expect($check.attr("checked")).not.be.undefined;
                });
                it("checked component attribute should be true",function(){
                    expect(instanceCheck.check()).to.be.true;
                });
            });
            describe("2.8.4 and disabled property is modified in checkbox",function(){
                it("disabled attribute should not be undefined",function(){
                    $check.prop("disabled",true);
                    instanceCheck.refresh();
                    expect($check.attr("disabled")).not.be.undefined;
                });
                it("disabled component attribute should be true",function(){
                    expect(instanceCheck.disable()).to.be.true;
                });
                it("couldn't be operated",function(){
                    instanceCheck.check(false);
                    expect(instanceCheck.check()).to.be.true;
                });
            });
            describe("2.8.5 and disabled attribute is modified in checkbox",function(){
                it("disabled property should be false",function(){
                    $check.removeAttr("disabled");
                    instanceCheck.refresh();
                    expect($check.prop("disabled")).to.be.false;
                });
                it("disabled component attribute should be false",function(){
                    expect(instanceCheck.disable()).to.be.false;
                });
                it("could be operated",function(){
                    instanceCheck.check(false);
                    expect(instanceCheck.check()).to.be.false;
                });
            });

        });

    });
})