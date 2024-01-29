"use strict";
const addItemInput = document.querySelector("form input");
const form = document.querySelector("form");
const shopList = document.querySelector(".items");
const clearBtn = document.querySelector("#clear");
// clearBtn.classList.add("disabled");
/* -------------------------------------------------------------------------- */
/*                    Add item to top or bottom of the list                   */
/* -------------------------------------------------------------------------- */
const toggleBtn = document.querySelector("#toggle");
function toggleButton(e) {
    console.log("saw");
    const isUp = toggleBtn.textContent === "⬆";
    toggleBtn.textContent = isUp ? "⬇" : "⬆";
    toggleBtn.setAttribute("data-direction", isUp ? "down" : "up");
}
toggleBtn.addEventListener("click", toggleButton);
/* -------------------------- Creating New Element -------------------------- */
function createElement(tag) {
    return document.createElement(tag);
}
/* -------------------------------------------------------------------------- */
/*                           Creating new list item                           */
/* -------------------------------------------------------------------------- */
function createButtonsOfItem(label) {
    const remBtn = createElement("button");
    remBtn.textContent = label;
    remBtn.addEventListener("click", (e) => {
        console.log("clicked on remove button");
    });
    return remBtn;
}
function createNewItem(value) {
    // li item
    const newItem = createElement("li");
    newItem.setAttribute("id", "item");
    newItem.className = "p-2 flex items-center justify-between border-2 border-black/30 rounded-md";
    // span text
    const text = createElement("span");
    text.textContent = value;
    /* --------------------------------- Buttons -------------------------------- */
    const allBtns = createElement("div");
    allBtns.className = "flex gap-2 bg-gray-300 rounded-md p-1";
    const remBtn = createElement("button");
    remBtn.textContent = "❌";
    const editBtn = createElement("button");
    editBtn.textContent = "➕";
    const doneBtn = createElement("button");
    doneBtn.textContent = "✔";
    allBtns.addEventListener("click", (e) => {
        console.log("clicked on button");
    });
    [doneBtn, editBtn, remBtn].forEach((btn) => {
        btn.setAttribute("type", "button");
        allBtns.appendChild(btn);
    });
    /* --------------------------------- Buttons -------------------------------- */
    newItem.appendChild(text);
    newItem.appendChild(allBtns);
    return newItem;
}
let allValues = localStorage.getItem("list") ? JSON.parse(localStorage.getItem("list")) : [];
function handleSubmit(e) {
    var _a;
    e.preventDefault();
    const value = addItemInput.value;
    if (!value) {
        return alert("Please enter a value");
    }
    // Select list or create if there is no list yest
    let list = (_a = document.querySelector("#items-list")) !== null && _a !== void 0 ? _a : null;
    if (!list) {
        list = createElement("ul");
        list.setAttribute("id", "items-list");
        list.className = "p-2 grid gap-2 font-bold";
    }
    const item = createNewItem(value);
    // add to UI
    const addToUp = toggleBtn.getAttribute("data-direction") === "up" ? true : false;
    addToUp ? list.insertAdjacentElement("afterbegin", item) : list.appendChild(item);
    allValues.push(value);
    shopList.innerHTML = list.outerHTML;
    // add to localstorage
    localStorage.setItem("list", JSON.stringify([...allValues, value]));
    // Clear and focus input
    addItemInput.value = "";
    addItemInput.focus();
    // Change opacity ofclear btn
    clearBtn.classList.remove("disabled");
    console.log("created");
}
form.addEventListener("submit", handleSubmit);
// Clear All Items
// let hasItems = shopList.contains(list);
function clearAll() {
    const emtpyList = createElement("h4");
    emtpyList.textContent = "Empty list";
    emtpyList.className = "text-3xl text-center font-bold my-4 opacity-50";
    // clearBtn.classList.add("disabled");
    shopList.innerHTML = emtpyList.outerHTML;
}
clearBtn.addEventListener("click", clearAll);
