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
            describe("1.6. And use data-customcr-* attributes for all", function () {
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
                    expect().to.be.true;
                });
            });
        });

        //checked
        //disabled
        //classes
        //events
        //wrapper
        //wrapper as an object
        //init data-customcr-* attributes
        //checked
        //disabled
        //classes

    });
})