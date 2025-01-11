"use strict";

import { getItemById, createOrder } from "./api.js";

const itemsContainer = document.querySelector(".items");

let itemsData = [];
const promises = [];

function createItemCard(data) {
    const card = document.createElement("div");
    card.className = "itemCard";
    card.setAttribute("data-id", data.id);
    card.setAttribute("data-category", data.main_category);

    const actual_price = data.actual_price;
    const discount_price = data.discount_price;
    let discount = (actual_price - discount_price) * 100 / actual_price;
    discount = String(Math.round(discount)) + "%";
    let oldPrice = String(actual_price) + "₽";
    let price;

    if (!discount_price) {
        price = String(actual_price) + "₽";
        oldPrice = "";
        discount = "";
    } else {
        price = String(discount_price) + "₽";
    }

    card.innerHTML = `
        <figure class="itemImg">
            <img
                src="${data.image_url}"
                alt=""
            />
        </figure>
        <div class="itemAttributes">
            <p class="itemName">${data.name}</p>
            <div class="itemRating">
                <span class="ratingValue">${data.rating}</span>
                <span>
                    <span class="star" data-value="1">&#9733;</span>
                    <span class="star" data-value="2">&#9733;</span>
                    <span class="star" data-value="3">&#9733;</span>
                    <span class="star" data-value="4">&#9733;</span>
                    <span class="star" data-value="5">&#9733;</span>
                </span>
            </div>
            <div class="itemPriceAndDiscount">
                <p class="price">${price}</p>
                <p class="oldPrice">${oldPrice}</p>
                <p class="discount">${discount}</p>
            </div>
            <button>Добавить</button>
        </div>
    `;
    const stars = card.querySelectorAll(".star");
    for (let i = 0; i < Math.round(data.rating); i++) {
        stars[i].classList.add("active");
    }
    return card;
}

function countPrice() {
    const items = itemsContainer.querySelectorAll(".itemCard");
    let totalPrice = 0;
    for (let item of items) {
        let strPrice = item.querySelector(".price").textContent.slice(0, -1);
        totalPrice += parseInt(strPrice);
    }
    totalPrice += 500;
    document.querySelector(".totalPrice").textContent = `${totalPrice}₽`;
}

function displayNothingSelected() {
    if (itemsData.length) {
        document.querySelector(".nothingSelected")
            .style.display = "none";
        return;
    }
    document.querySelector(".totalPrice").textContent = "";
    document.querySelector(".nothingSelected").style.display = "inline";
}

function renderSelectedItems() {
    itemsContainer.innerHTML = "";
    itemsData.forEach(data => {
        const card = createItemCard(data);
        card.querySelector("button").textContent = "Удалить";
        itemsContainer.append(card);
    });
    countPrice();
    displayNothingSelected();
}

for (let i = 0; i < localStorage.length; i++) {
    let key = window.localStorage.key(i);
    let id = window.localStorage.getItem(key);
    promises.push(getItemById(id).then(data => {
        itemsData.push(data);
    }));
}

if (promises.length != 0) {
    Promise.all(promises).then(() => {
        console.log("here");
        renderSelectedItems();
    });
}

function removeDish(id) {
    window.localStorage.removeItem(`${id}`);
    for (let i = 0; i < itemsData.length; i++) {
        if (itemsData[i].id == id) {
            itemsData.splice(i, 1);
            return;
        }
    }
}

itemsContainer.onclick = function(e) {
    let target = e.target;
    if (target.tagName != "BUTTON") return;

    const card = target.parentElement.parentElement;
    removeDish(Number(card.dataset.id));
    renderSelectedItems();
};

const closeNotificationBtn = document.querySelector(".closeNotification");
closeNotificationBtn.onclick = function() {
    closeNotificationBtn.parentElement.style.display = "none";
};

function displayModal(text) {
    const window = document.getElementById("window");
    const p = window.querySelector(".text");
    
    p.textContent = text;
    modal.className = "modal active";
}

document.querySelector("form").addEventListener("submit", async function(e) {
    e.preventDefault();

    if (window.localStorage.length == 0) {
        displayModal("Ничего не выбрано! Выберите товары в каталоге!");
        return;
    }

    const items = itemsContainer.querySelectorAll(".itemCard");
    const goodsIds = [];
    for (let item of items) {
        let id = item.dataset.id;
        goodsIds.push(id);
    }

    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        console.log(key);
        if (key == "subscribe") {
            formObject[key] = formData.get(key) == "on";
        } else if (key == "delivery_date") {
            const [year, month, day] = value.split("-");
            const normalDate = `${day}.${month}.${year}`;
            formObject[key] = normalDate;
        } else {
            formObject[key] = value;
        }
    });

    formObject.good_ids = goodsIds;

    const response = await createOrder({
        body: JSON.stringify(formObject),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Error creating order");
    } else {
        // itemsContainer.innerHTML = "";
        window.localStorage.clear();
        itemsData = [];
        renderSelectedItems();
        this.reset();
        displayModal("Заказ успешно оформлен!");
    }
});

const okayBtn = document.querySelector(".okayBtn");
okayBtn.onclick = function() {
    modal.className = "modal";
};