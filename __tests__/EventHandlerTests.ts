import { Event, Reactor } from '../src/EventHandler';

describe("Event", function () {

    describe("executeCallback parameter logic", function () {

        it("does not call callback when params is undefined", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback(undefined);

            expect(fn).not.toHaveBeenCalled();
        });

        it("does not call callback when params is null", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback(null);

            expect(fn).not.toHaveBeenCalled();
        });

        it("does not call callback when params is empty string", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback("");

            expect(fn).not.toHaveBeenCalled();
        });

        it("does not call callback when params is an empty object", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback({});

            expect(fn).not.toHaveBeenCalled();
        });

        it("calls callback with no arguments when params is an empty array", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback([]);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(/* no args */);
        });

        it("calls callback with the value when params is a non-empty object", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);
            const payload = { data: "hello" };

            event.executeCallback(payload);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(payload);
        });

        it("calls callback with the value when params is a non-empty array", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);
            const payload = [1, 2, 3];

            event.executeCallback(payload);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(payload);
        });

        it("calls callback with the value when params is a non-empty string", function () {
            const event = new Event("test");
            const fn = jest.fn();
            event.registerCallback(fn);

            event.executeCallback("hello");

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith("hello");
        });
    });

    describe("error isolation", function () {

        it("a throwing callback does not prevent subsequent callbacks from running", function () {
            const event = new Event("test");
            const throwing = jest.fn().mockImplementation(() => { throw new Error("boom"); });
            const safe = jest.fn();
            event.registerCallback(throwing);
            event.registerCallback(safe);

            expect(() => event.executeCallback("go")).not.toThrow();
            expect(safe).toHaveBeenCalledTimes(1);
        });
    });

    describe("multiple callbacks", function () {

        it("calls all registered callbacks in order", function () {
            const event = new Event("test");
            const order: number[] = [];
            event.registerCallback(() => order.push(1));
            event.registerCallback(() => order.push(2));
            event.registerCallback(() => order.push(3));

            event.executeCallback("go");

            expect(order).toEqual([1, 2, 3]);
        });
    });
});

describe("Reactor", function () {

    it("fires registered callback via raiseEvent", function () {
        const reactor = new Reactor();
        const fn = jest.fn();
        reactor.registerEvent("myEvent", fn);

        reactor.raiseEvent("myEvent", { value: 42 });

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith({ value: 42 });
    });

    it("silently does nothing when raising an unregistered event", function () {
        const reactor = new Reactor();
        expect(() => reactor.raiseEvent("nonexistent", "data")).not.toThrow();
    });

    it("adds multiple callbacks to the same event", function () {
        const reactor = new Reactor();
        const fn1 = jest.fn();
        const fn2 = jest.fn();
        reactor.registerEvent("evt", fn1);
        reactor.registerEvent("evt", fn2);

        reactor.raiseEvent("evt", "ping");

        expect(fn1).toHaveBeenCalledWith("ping");
        expect(fn2).toHaveBeenCalledWith("ping");
    });

    it("distinct events do not cross-fire", function () {
        const reactor = new Reactor();
        const fnA = jest.fn();
        const fnB = jest.fn();
        reactor.registerEvent("A", fnA);
        reactor.registerEvent("B", fnB);

        reactor.raiseEvent("A", "only-A");

        expect(fnA).toHaveBeenCalledTimes(1);
        expect(fnB).not.toHaveBeenCalled();
    });
});
