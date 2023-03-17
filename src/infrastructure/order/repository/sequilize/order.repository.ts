import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    product_id: item.productId,
                    quantity: item.quantity,
                })),
            },
            {
                include: [{model: OrderItemModel}],
            }
        );
    }

    async find(id: string): Promise<Order> {
        let orderModel;
        try {
            orderModel = await OrderModel.findOne({where: {id}, include: ["items"], rejectOnEmpty: true})
        } catch (error) {
            throw new Error("Order not found");
        }

        const orderItems = orderModel.items.map((item) => {
            return new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
        })

        return new Order(orderModel.id, orderModel.customer_id, orderItems);
    }

    async findAll(): Promise<Order[]> {
        const ordersModel = await OrderModel.findAll({include: ["items"]})
        return ordersModel.map((orderModel) => {
            const orderItems = orderModel.items.map((orderItemModel) => {
                return new OrderItem(orderItemModel.id, orderItemModel.name, orderItemModel.price, orderItemModel.product_id, orderItemModel.quantity);
            })
            return new Order(orderModel.id, orderModel.customer_id, orderItems)
        })
    }

    async update(entity: Order): Promise<void> {
        const seq = OrderModel.sequelize;
        await seq?.transaction(async (t) => {
            await OrderItemModel.destroy({
                where: {order_id: entity.id},
                transaction: t
            })
            const items = entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: entity.id,
            }))
            await OrderItemModel.bulkCreate(items, {transaction: t});
            await OrderModel.update({
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
            }, {
                where: {
                    id: entity.id,
                },
            })
        })
    }
}
