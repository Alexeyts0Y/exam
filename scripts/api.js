"use strict";

const key = "?api_key=d6d50fc0-628f-4069-b854-bf25968b4cad";
const address = "https://edu.std-900.ist.mospolytech.ru";

export async function getAllItems() {
    const URL = address + "/exam-2024-1/api/goods" + key;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить товары: ", err);
        });
}

export async function getItemsByQuery(query) {
    const URL = address + `/exam-2024-1/api/goods` + key + `&query=${query}`;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить товары по запросу: ", err);
        });
}

export async function getAllItemsPaginate(page) {
    const URL = address + "/exam-2024-1/api/goods" 
                        + key + `&page=${page}&per_page=12`;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить товары: ", err);
        });
}

export async function getItemById(id) {
    const URL = address + `/exam-2024-1/api/goods/${id}` + key;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить данные конкретного товара: ", err);
        });
}

export async function getAllOrders() {
    const URL = address + "/exam-2024-1/api/orders" + key;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить заказы: ", err);
        });
}

export async function getOrderById(id) {
    const URL = address + `	/exam-2024-1/api/orders/${id}` + key;

    return fetch(URL)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log("Не удалось получить данные конкретного заказа: ", err);
        });
}

export async function createOrder(options) {
    const url = address + "/exam-2024-1/api/orders" + key;

    const requestOptions = {
        method: "POST",
        headers: options.headers,
        body: options.body
    };

    return fetch(url, requestOptions)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.log("Не удалось создать заказ: ", err);
        });
}
export async function editOrder(id, options) {
    const url = address + `/exam-2024-1/api/orders/${id}` + key;

    const requestOptions = {
        method: "PUT",
        headers: options.headers,
        body: options.body
    };

    return fetch(url, requestOptions)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.log("Не удалось изменить заказ: ", err);
        });
}

export async function deleteOrder(id) {
    const url = address + `/exam-2024-1/api/orders/${id}` + key;
    
    const options = {
        method: "DELETE"
    };
    
    return fetch(url, options)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.log("Не удалось удалить заказ: ", err);
        });
}