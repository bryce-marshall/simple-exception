import { suite, test } from "mocha-typescript";
import { expect } from "chai";
import { SimpleException } from "./package-src/index";

@suite class SimpleExceptionTests {
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
        }
    }

    @test("Exception toString (with message)") ExceptionToStringWithMessage() {
        try {
            throw new SimpleException("InvalidOperation", "Message");
        } catch (e) {
            expect(e.toString()).to.equal("InvalidOperation Error: Message");
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
}