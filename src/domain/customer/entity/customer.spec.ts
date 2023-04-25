import Address from "../value-object/address";
import Customer from "./customer";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import FirstConsoleWhenCustomerIsCreatedHandler from "../event/handler/first-console-when-customer-is-created.handler";
import SecondConsoleWhenCustomerIsCreatedHandler
  from "../event/handler/second-console-when-customer-is-created.handler";
import CustomerCreatedEvent from "../event/customer-created.event";
import ShowConsoleWhenAddressIsChangedHandler from "../event/handler/show-console-when-address-is-changed.handler";
import AddressChangedEvent from "../event/address-changed.event";

describe("Customer unit tests", () => {
  it("should throw error when id is empty", () => {
    expect(() => {
      let customer = new Customer("", "John");
    }).toThrowError("Id is required");
  });

  it("should throw error when name is empty", () => {
    expect(() => {
      let customer = new Customer("123", "");
    }).toThrowError("Name is required");
  });

  it("should change name", () => {
    // Arrange
    const customer = new Customer("123", "John");

    // Act
    customer.changeName("Jane");

    // Assert
    expect(customer.name).toBe("Jane");
  });

  it("should activate customer", () => {
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.Address = address;

    customer.activate();

    expect(customer.isActive()).toBe(true);
  });

  it("should throw error when address is undefined when you activate a customer", () => {
    expect(() => {
      const customer = new Customer("1", "Customer 1");
      customer.activate();
    }).toThrowError("Address is mandatory to activate a customer");
  });

  it("should deactivate customer", () => {
    const customer = new Customer("1", "Customer 1");

    customer.deactivate();

    expect(customer.isActive()).toBe(false);
  });

  it("should add reward points", () => {
    const customer = new Customer("1", "Customer 1");
    expect(customer.rewardPoints).toBe(0);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(10);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(20);
  });

  it('should notify when customer is created', function () {
    const eventDispatcher = new EventDispatcher();

    const eventHandlerOne = new FirstConsoleWhenCustomerIsCreatedHandler();
    const eventHandlerTwo = new SecondConsoleWhenCustomerIsCreatedHandler();

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerOne);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerTwo);

    const spyEventOne = jest.spyOn(eventHandlerOne, "handle");
    const spyEventTwo = jest.spyOn(eventHandlerTwo, "handle");

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandlerOne);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandlerTwo);

    const customerCreatedEvent = new CustomerCreatedEvent({})
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventOne).toHaveBeenCalled();
    expect(spyEventTwo).toHaveBeenCalled();

  });

  it('should notify when address is changed', function () {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new ShowConsoleWhenAddressIsChangedHandler();
    eventDispatcher.register("AddressChangedEvent", eventHandler);

    const spyEvent = jest.spyOn(eventHandler, "handle")
    expect(eventDispatcher.getEventHandlers["AddressChangedEvent"][0]).toMatchObject(eventHandler);

    const customerAddressChangedEvent = new AddressChangedEvent({
      id: "01239012490",
      name: "Victor",
      address: "Avenida...",
    })
    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyEvent).toHaveBeenCalled();
  });
});
