
import Datastore from '@seald-io/nedb';

const async = require("async");

let inventoryDB = new Datastore({
    filename: "./server/databases/inventory.db",
    autoload: true
});

const find = (_id: string) => {
    if (!_id) {
        return Promise.reject("ID field is required.");
    } else {
        return inventoryDB.findOneAsync({ _id });
    }
};

const list = (params={}) => {
    return inventoryDB.findAsync(params);
};

const create = (body: any) => {
    return inventoryDB.insertAsync(body);
};

const remove = (_id: string) => {
    return inventoryDB.removeAsync({
        _id
    }, {});
};

const update = (body: any) => {
    let { id, ...product } = body;
    return inventoryDB.updateAsync({ _id: id }, product, {});
};

const decrementInventory = (products: any) => {
    async.eachSeries(products, (transactionProduct: any, callback: any) => {
        inventoryDB.findOneAsync({
            _id: transactionProduct._id
        }).then((product: any) => {
            if (!product || !product.quantity_on_hand) {
                callback();
            } else {
                let updatedQuantity =
                    parseInt(product.quantity_on_hand) -
                    parseInt(transactionProduct.quantity);
                inventoryDB.updateAsync({
                    _id: product._id
                }, {
                    $set: {
                        quantity_on_hand: updatedQuantity
                    }
                }).then(callback);
            }
        });
    });
};

export default { list, find, create, update, remove, decrementInventory }