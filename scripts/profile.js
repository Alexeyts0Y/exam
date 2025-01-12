"use strict";

import { getAllOrders } from "../scripts/api.js";
import { getItemById } from "../scripts/api.js";
import { getOrderById } from "../scripts/api.js";
import { editOrder } from "../scripts/api.js";
import { deleteOrder } from "../scripts/api.js";

const ordersContainer = document.querySelector(".ordersContainer");
const closeBtn = document.querySelector(".closeBtn");
const okayBtn = document.querySelector(".okayBtn");
const cancelBtn = document.querySelector(".cancelBtn");
const saveBtn = document.querySelector(".saveBtn");
const yesBtn = document.querySelector(".yesBtn");

function displayNotification(mode, text) {
    const notification = document.querySelector(".notification");
    const p = document.querySelector(".message");
    if (mode == "success") {
        notification.style.backgroundColor = "#7edaf7";
    } else {
        notification.style.backgroundColor = "red";
    }
    p.textContent = text;
    notification.style.display = "flex";
}

function createElement(tag, classname) {
    let elem = document.createElement(tag);
    elem.className = classname;
    return elem;
}

async function getOrderItems(order) {
    const promises = [];
    const itemsIds = [...order.good_ids];
    for (let id of itemsIds) {
        if (!id) continue;
        promises.push(getItemById(id));
    }
    const items = await Promise.all(promises);
    return items;
}

async function countPrice(items) {
    let totalPrice = 0;
    for (const item of items) {
        if (!item.discount_price) {
            totalPrice += item.actual_price;
        } else {
            totalPrice += item.discount_price;
        }
    }
    return totalPrice + 500;
}

async function createAndFillOrderElement(order, index) { //correct
    const orderElement = createElement("div", "order");
    const date = new Date(order.created_at).toLocaleDateString();

    const orderItems = await getOrderItems(order); // Correct
    const totalPrice = await countPrice(orderItems); // Correct

    orderElement.setAttribute("data-id", order.id);
    orderElement.innerHTML = `
        <p class="number">${index + 1}</p>
        <p class="date">${date}</p>
        <div class="compound">
            ${orderItems.map(item => item.name).join(', ')}
        </div>
        <p class="price">${totalPrice}₽</p>
        <div class="time">
            <div>${order.delivery_date}</div>
            <div>${order.delivery_interval}</div>
        </div>
        <div class="actions">
            <button class="detailsBtn">
                <img src="../img/icons/details.png" alt="">
            </button>
            <button class="editBtn">
                <img src="../img/icons/edit.png" alt="">
            </button>
            <button class="deleteBtn">
                <img src="../img/icons/delete.png" alt="">
            </button>
        </div>
    `;
    return orderElement;
}

async function displayAllOrders() {
    const orders = await getAllOrders();
    const ordersContainer = document.querySelector(".ordersContainer");
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    ordersContainer.innerHTML = "";

    for (const [index, order] of orders.entries()) {
        const orderElement = await createAndFillOrderElement(order, index);
        ordersContainer.append(orderElement);
    }
}

displayAllOrders();

const modal = document.getElementById("modal");
function displayModal() {
    modal.classList.toggle("active");
}


function createItemsList(items) {
    const itemsList = createElement("div", "itemsList");
    const label = document.createElement("p");
    const value = document.createElement("p");
    let itemsNames = [];
    let counter = 1;
    for (let item of items) {
        itemsNames.push(`${counter}) ${item.name}`);
        counter++;
    }

    label.textContent = "Состав заказа";
    value.innerHTML = `${itemsNames.join('<br>')}`;
    itemsList.append(label);
    itemsList.append(value);
    
    return itemsList;
}

async function createAndDisplayDetails(itemId) {
    const orderElement = document.getElementById("content");
    const form = document.getElementById("changeData");
    const confirmDeleting = document.getElementById("confirmDeleting");
    const order = await getOrderById(itemId);
    const orderItems = await getOrderItems(order); // Correct
    const totalPrice = await countPrice(orderItems); // Correct
    const itemsList = await createItemsList(orderItems);
    const date = new Date(order.created_at).toLocaleDateString();
    const labelTop = document.querySelector(".labelHead");
    const bottomBtns = document.querySelector(".labelBottom");
    let comment = order.comment;
    if (!comment) {
        comment = "";
    }

    orderElement.style.display = "grid";
    form.style.display = "none";
    confirmDeleting.style.display = "none";
    
    labelTop.querySelector("h2").textContent = "Просмотр заказа";
    bottomBtns.querySelector(".okayBtn").style.display = "block";
    bottomBtns.querySelector(".cancelBtn").style.display = "none";
    bottomBtns.querySelector(".saveBtn").style.display = "none";
    bottomBtns.querySelector(".yesBtn").style.display = "none";

    orderElement.innerHTML = "";
    orderElement.innerHTML = `
        <p class="dateOfIssue">Дата оформления</p>
        <p class="dateVal">${date}</p>
        <div class="deliveryData">
            <p class="fullName">Имя получателя</p>
            <p class="fullNameVal">${order.full_name}</p>
            <p class="phone">Телефон</p>
            <p class="phoneVal">${order.phone}</p>
            <p class="email">Email</p>
            <p class="emailVal">${order.email}</p>
            <p class="deliveryAddress">Адрес доставки</p>
            <p class="deliveryAddressVal">${order.delivery_address}</p>
            <p class="deliveryDate">Дата доставки</p>
            <p class="deliveryDateVal">${order.delivery_date}</p>
            <p class="deliveryInterval">Время доставки</p>
            <p class="deliveryIntervalVal">${order.delivery_interval}</p>
        </div>
        <h3 class="totalPrice">Стоимость: ${totalPrice}₽</h3>
        <h3 class="comment">Комментарий</h3>
        <div class="commentVal">${comment}</div>
    `;
    orderElement.querySelector(".deliveryData").after(itemsList);
}

async function createAndDisplayChangeWindow(orderId) {
    const elem = document.getElementById("content");
    const form = document.getElementById("changeData");
    const confirmDeleting = document.getElementById("confirmDeleting");
    const order = await getOrderById(orderId);
    const orderItems = await getOrderItems(order); // Correct
    const totalPrice = await countPrice(orderItems); // Correct
    const itemsList = await createItemsList(orderItems);
    const date = new Date(order.created_at).toLocaleDateString();
    const labelTop = document.querySelector(".labelHead");
    const bottomBtns = document.querySelector(".labelBottom");
    let comment = order.comment;
    if (!comment) {
        comment = "";
    }

    form.style.display = "grid";
    elem.style.display = "none";
    confirmDeleting.style.display = "none";

    labelTop.querySelector("h2").textContent = "Редактирование заказа";
    bottomBtns.querySelector(".okayBtn").style.display = "none";
    bottomBtns.querySelector(".cancelBtn").style.display = "block";
    bottomBtns.querySelector(".saveBtn").style.display = "block";
    bottomBtns.querySelector(".yesBtn").style.display = "none";

    form.setAttribute("data-orderid", orderId);
    form.innerHTML = "";
    form.innerHTML = `
        <p class="dateOfIssue">Дата оформления</p>
        <p class="dateVal">${date}</p>
        <label for="full_name" class="fullName">Имя получателя</label>
        <input type="text" name="full_name" id="fullName"
            class="fullNameVal" 
            value="${order.full_name}"
        >
        <label for="phone" class="phone">Телефон</label>
        <input type="tel" name="phone" id="phone"
            class="phoneVal"
            value="${order.phone}"
        >
        <label for="email" class="email">Email</label>
        <input type="email" name="email" id="email"
            class="emailVal"
            value="${order.email}"
        >
        <label for="delivery_address" class="deliveryAddress">Адрес доставки
        </label>
        <input type="text" name="delivery_address" id="deliveryAddress"
            class="deliveryAddressVal"
            value="${order.delivery_address}"    
        >
        <label for="delivery_Date" class="deliveryDate">Дата доставки
        </label>
        <input type="date" name="delivery_date" id="deliveryDate" 
            class="deliveryDateVal"
            value="${order.delivery_date}"
        >
        <label for="delivery_interval" class="deliveryInterval">Время доставки
        </label>
        <select name="delivery_interval" 
        id="deliveryInterval" class="deliveryIntervalVal">
            <option value="08:00-12:00">08:00-12:00</option>
            <option value="12:00-14:00">12:00-14:00</option>
            <option value="14:00-18:00">14:00-18:00</option>
            <option value="18:00-22:00">18:00-22:00</option>
        </select>
        <h3 class="totalPrice">Стоимость: ${totalPrice}₽</h3>
        <label for="comment" class="comment">Комментарий</label>
        <textarea name="comment" id="comment" class="commentVal">
            ${comment}
        </textarea>
    `;

    form.querySelector("#deliveryInterval").value = order.delivery_interval;
    form.querySelector(".deliveryIntervalVal").after(itemsList);
}

async function createAndDisplayQuestion(orderId) {
    const orderElement = document.getElementById("content");
    const form = document.getElementById("changeData");
    const confirmDeleting = document.getElementById("confirmDeleting");
    const labelTop = document.querySelector(".labelHead");
    const bottomBtns = document.querySelector(".labelBottom");
    
    orderElement.style.display = "none";
    form.style.display = "none";
    confirmDeleting.style.display = "block";
    
    labelTop.querySelector("h2").textContent = "Удаление заказа";
    bottomBtns.querySelector(".okayBtn").style.display = "none";
    bottomBtns.querySelector(".cancelBtn").style.display = "block";
    bottomBtns.querySelector(".saveBtn").style.display = "none";
    bottomBtns.querySelector(".yesBtn").style.display = "";

    confirmDeleting.innerHTML = "";
    confirmDeleting.innerHTML = `
        <div class="question" data-orderid="${orderId}">
            Вы уверены что хотите удалить заказ?
        </div>
    `;
}

ordersContainer.onclick = async function(e) {
    let target = e.target;
    if (target.tagName == "IMG") {
        target = target.parentElement;
    }
    const order = target.parentElement.parentElement;

    if (target.classList.contains("detailsBtn")) {
        await createAndDisplayDetails(order.dataset.id);
        displayModal();
    } else if (target.className == "editBtn") {
        await createAndDisplayChangeWindow(order.dataset.id);
        displayModal();
    } else if (target.className == "deleteBtn") {
        await createAndDisplayQuestion(order.dataset.id);
        displayModal();
    }
};

closeBtn.onclick = function() {
    displayModal();
};

okayBtn.onclick = function() {
    displayModal();
};

cancelBtn.onclick = function() {
    displayModal();
};

saveBtn.onclick = async function() {
    const form = document.getElementById("changeData");
    let formData = new FormData(form);

    const formObject = {};
    formData.forEach((value, key) => {
        if (key == "delivery_date") {
            const [year, month, day] = value.split("-");
            const normalDate = `${day}.${month}.${year}`;
            formObject[key] = normalDate;
        } else {
            formObject[key] = value;
        }
    });

    const response = await editOrder(form.dataset.orderid, {
        body: JSON.stringify(formObject),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errMessage = await response.json().error;
        displayNotification("fail", String(errMessage));
        throw new Error(errMessage);
    } else {
        displayModal();
        displayAllOrders();
        displayNotification("success", "Заказ успешно изменен!");
    }
};

yesBtn.onclick = async function () {
    const question = document.querySelector(".question");
    const response = await deleteOrder(question.dataset.orderid);
    if (!response.ok) {
        const errMessage = await response.json().error;
        displayNotification("fail", String(errMessage));
        throw new Error(errMessage);
    } else {
        displayModal();
        displayAllOrders();
        displayNotification("success", "Заказ успешно изменен!");
    }
};

const closeNotificationBtn = document.querySelector(".closeNotification");
closeNotificationBtn.onclick = function() {
    closeNotificationBtn.parentElement.style.display = "none";
};