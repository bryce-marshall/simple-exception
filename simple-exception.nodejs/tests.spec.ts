import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { SimpleException } from "./package-src/index";

class ExtendedException extends SimpleException {
    constructor(message?: string) {
        super("Extended", message);
    }

    get customProperty(): string {
        return "ExtendedException.customProperty value";
    }
}

export class Exception extends SimpleException {
    constructor(errorName: string, message?: string) {
        super(errorName, message);
    }

    get customPropertyOne(): string {
        return "Exception.customPropertyOne value";
    }
}

class FurtherExtendedException extends Exception {
    constructor(message?: string) {
        super("FurtherExtended", message)
    }

    get customPropertyTwo(): string {
        return "FurtherExtendedException.customPropertyTwo value";
    }
}

class CustomStringException extends SimpleException {
    constructor() {
        super("CustomString");
    }

    toString(): string {
        return "Custom toString method";
    }
}

@suite class SimpleExceptionTests {
    // @test("Error Constructor") ErrorConstructor() {
    //     let e = new FurtherExtendedException("Test");
    //     console.log("*** e.name = " + e.name);
    //     console.log("*** e.message = " + e.message);
    //     console.log(e.stack);
    // }

    @test("Custom toString") CustomToString() {
        let e = new CustomStringException();
        expect(e.toString()).to.equal("Custom toString method");
    }

    @test("Is Error Native") IsErrorNative() {
        let e = new Error();
        expect(SimpleException.isError(e)).to.equal(true);
    }

    @test("Is Error Exception") IsErrorException() {
        let e = new SimpleException("Test");
        expect(SimpleException.isError(e)).to.equal(true);
    }
    @test("Application No Message") ApplicationNoMessage() {
        let e = new SimpleException("Application");
        assertException(e, "Application");
    }

    @test("InvalidOperation No Message") InvalidOperationNoMessage() {
        let e = new SimpleException("InvalidOperation");
        assertException(e, "InvalidOperation");
    }

    @test("InvalidOperation with Message") InvalidOperationWithMessage() {
        assertException(new SimpleException("InvalidOperation", "Test invalid op"), "InvalidOperation", "Test invalid op");
    }

    @test("ApplicationException eval type") ApplicationExceptionEvalType() {
        try {
            throw new SimpleException("Application");
        } catch (e) {
            assertException(e, "Application");
        }
    }

    @test("Convert Native Error") ConvertNativeError() {
        try {
            throw new RangeError();
        } catch (e) {
            assertError(e, "RangeError")
            e = SimpleException.convert(e);
            assertException(e, "RangeError");
        }
    }

    @test("Native Error toString") NativeErrorToString() {
        try {
            throw new Error();
        } catch (e) {
            e = SimpleException.convert(e);
            expect(e.toString()).to.equal("Error");
        }
    }

    @test("Native Error toString (with message)") NativeErrorToStringWithMessage() {
        try {
            throw new Error("Message");
        } catch (e) {
            e = SimpleException.convert(e);
            expect(e.toString()).to.equal("Error: Message");
            // console.log(e.stack);
        }
    }

    @test("Exception toString (with message)") ExceptionToStringWithMessage() {
        try {
            throw new SimpleException("InvalidOperation", "Message");
        } catch (e) {
            expect(e.toString()).to.equal("InvalidOperation Error: Message");
            expect(typeof (e.stack)).to.equal("string");
            // console.log(e.stack);
        }
    }

    @test("Extended Exception") ExtendedException() {
        try {
            throw new ExtendedException("A custom message");
        } catch (e) {
            assertException(e, "Extended");
            expect(e.toString()).to.equal("Extended Error: A custom message");
            expect(e.customProperty).to.equal("ExtendedException.customProperty value");
            expect(typeof (e.stack)).to.equal("string");
        }
    }

    @test("Further Extended Exception") FurtherExtendedException() {
        try {
            throw new FurtherExtendedException("A custom message");
        } catch (e) {
            assertException(e, "FurtherExtended");
            expect(e.toString()).to.equal("FurtherExtended Error: A custom message");
            expect(e.customPropertyOne).to.equal("Exception.customPropertyOne value");
            expect(e.customPropertyTwo).to.equal("FurtherExtendedException.customPropertyTwo value");
            expect(typeof (e.stack)).to.equal("string");
        }
    }
}

const assertError = (error: Error, expectedType: string, expectedMessage?: string) => {
    expect(error.name).to.equal(expectedType);
    if (expectedMessage)
        expect(error.message).to.equal(expectedMessage);

    let t = "is" + expectedType + "Exception";
    expect(error["isException"]).to.equal(undefined);
    expect(error[t]).to.equal(undefined);
}

const assertException = (error: Error, expectedType: string, expectedMessage?: string) => {
    expect(error["isException"]).to.equal(true, "isException property missing or invalid.");
    let t = "is" + expectedType + "Exception";
    expect(error[t]).to.equal(true, t + " property missing or invalid.");
    expect(error.name).to.equal(expectedType, "name property missing or invalid.");
    if (expectedMessage)
        expect(error.message).to.equal(expectedMessage, "message property invalid.");
    expect(typeof (error.stack)).to.equal("string");
    expect(error.stack.length).greaterThan(0);
}