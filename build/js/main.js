"use strict";
const form = document.querySelector("form");
const addItemInput = form.querySelector("input");
const toggleBtn = document.querySelector("#toggle");
const submitBtn = document.querySelector("button[type='submit']");
const filterInput = document.querySelector("#filter-input");
const shopContainer = document.querySelector(".items");
const emptyInfo = shopContainer.querySelector("h4");
const clearBtn = document.querySelector("#clear");
const modal = document.querySelector("#modal");
const list = createElement("ul");
list.setAttribute("id", "items-list");
list.className = "p-2 grid gap-2 font-bold";
/* ------------------ Add item to top or bottom of the list ----------------- */
const toggleButton = () => toggleBtn.classList.toggle("rotate-180");
/* ------------------------- Get, add, and remove items from storage ------------------------- */
function getItemsFromStorage() {
    return JSON.parse(localStorage.getItem("items") || "[]");
}
function setStorageItemsTo(items) {
    localStorage.setItem("items", JSON.stringify(items));
}
function addItemToStorage(text) {
    const items = getItemsFromStorage();
    items.push({ completed: false, text });
    setStorageItemsTo(items);
}
function updateItemOfStorage(text, checked, newText) {
    const updated = getItemsFromStorage().map((item) => item.text === text ? { completed: checked !== null && checked !== void 0 ? checked : item.completed, text: newText !== null && newText !== void 0 ? newText : item.text } : item);
    setStorageItemsTo(updated);
}
function removeItemFromStorage(text) {
    const filtered = getItemsFromStorage().filter((item) => item.text !== text);
    setStorageItemsTo(filtered);
}
/* -------------------------- Creating New Element -------------------------- */
function createElement(tag, textContent, className) {
    const element = document.createElement(tag);
    if (tag === "button")
        element.setAttribute("type", "button");
    if (textContent)
        element.appendChild(document.createTextNode(textContent));
    return element;
}
/* ------------------------- Creating new list item ------------------------- */
function createNewItem(value, checked) {
    // <li> item
    const newItem = createElement("li");
    newItem.setAttribute("id", "item");
    newItem.className = "p-2 flex items-center justify-between border-2 border-black/30 rounded-md";
    // <span> text
    const text = createElement("span", value);
    if (checked)
        markItemAsCompleted(text);
    // <div> <input> <buttons> </div>
    const allActions = createElement("div");
    allActions.className = "flex gap-2 bg-gray-300 rounded-md p-1 items-center";
    // <input> checkbox
    const checkedEl = createElement("input");
    checkedEl.type = "checkbox";
    checkedEl.className = "w-5 h-5";
    checkedEl.checked = checked || false;
    const editBtn = createElement("button", "🖊");
    editBtn.setAttribute("id", "update");
    const remBtn = createElement("button", "❌");
    remBtn.setAttribute("id", "remove");
    allActions.appendChild(checkedEl);
    allActions.appendChild(remBtn);
    allActions.appendChild(editBtn);
    newItem.appendChild(text);
    newItem.appendChild(allActions);
    return newItem;
}
/* ------------------------------- Remove Item ------------------------------- */
function removeItem(element) {
    element.remove();
    const text = element.querySelector("span").textContent;
    removeItemFromStorage(text);
    if (list.children.length === 0)
        replaceListAndEmpty(emptyInfo);
    updateUIOfActions();
}
/* ------------------------- Mark Item as Completed ------------------------- */
function markItemAsCompleted(element) {
    const classNames = ["line-through", "font-normal", "opacity-40"];
    classNames.forEach((className) => element.classList.toggle(className));
}
/* ------------------------ Open Modal Before Delete ------------------------ */
function openDialog(element, type) {
    let content = modal.querySelector(`#${type}`);
    if (type === "clearAll")
        content = modal.querySelector(`#remove`);
    [modal, content].forEach((element) => {
        element.classList.replace("opacity-0", "opacity-100");
        element.classList.replace("pointer-events-none", "pointer-events-auto");
    });
    modal.addEventListener("click", closeDialog);
    content.addEventListener("click", (e) => {
        e.stopPropagation();
        switch (type) {
            case "remove":
                deleteItem(e);
                break;
            case "clearAll":
                clearAll();
                break;
        }
    });
    function deleteItem(e) {
        const clicked = e.target;
        const success = clicked.getAttribute("id") === "yes";
        if (clicked.nodeName === "BUTTON") {
            if (success) {
                removeItem(element);
            }
            closeDialog();
        }
    }
}
function closeDialog() {
    modal.classList.replace("opacity-100", "opacity-0");
    modal.classList.replace("pointer-events-auto", "pointer-events-none");
    modal.querySelectorAll("aside").forEach((aside) => {
        aside.classList.replace("opacity-100", "opacity-0");
        aside.classList.replace("pointer-events-auto", "pointer-events-none");
    });
}
/* ------------------------------- Edit Item ------------------------------- */
let editMode = false;
function setItemToEdit(element) {
    editMode = true;
    submitBtn.classList.replace("bg-black/80", "bg-green-500");
    submitBtn.textContent = "Update";
    list.querySelectorAll("#item").forEach((item) => item.classList.remove("opacity-50"));
    // we need to remove opacity-50 from all items before adding it to the new item
    element.classList.add("opacity-50");
    const span = element.firstElementChild;
    addItemInput.value = span.textContent;
}
function onClick(e) {
    var _a;
    const clicked = e.target;
    const isButtonClicked = clicked.nodeName === "BUTTON";
    const isCheckboxClicked = clicked.nodeName === "INPUT";
    const mainElement = clicked.closest("li");
    if (isButtonClicked) {
        // openDialog(mainElement, "remove");
        switch (clicked.getAttribute("id")) {
            case "remove":
                openDialog(mainElement, "remove");
                break;
            case "update":
                setItemToEdit(mainElement);
                break;
        }
    }
    else if (isCheckboxClicked) {
        const element = (_a = clicked.parentElement) === null || _a === void 0 ? void 0 : _a.previousElementSibling;
        const input = clicked;
        updateItemOfStorage(element.textContent, input.checked);
        markItemAsCompleted(element);
    }
}
/* ------------------------------- Form Submit ------------------------------ */
function handleSubmit(e) {
    var _a;
    e.preventDefault();
    const storageItems = getItemsFromStorage().map(({ text }) => text);
    const value = addItemInput.value.trim();
    if (!value) {
        return alert("Please enter a value");
    }
    else if (storageItems.includes(value)) {
        return alert("Item already exists");
    }
    else if (editMode) {
        const item = (_a = list.querySelector(".opacity-50")) === null || _a === void 0 ? void 0 : _a.querySelector("span");
        updateItemOfStorage(item.innerText, undefined, value);
        item.innerText = value;
        item.parentElement.classList.remove("opacity-50");
        editMode = false;
    }
    else {
        // Add to UI and storage
        addItemToUI(value);
        // Add to  storage
        addItemToStorage(value);
    }
    updateUIOfActions();
    // Clear and focus input
    addItemInput.value = "";
    addItemInput.focus();
}
function addItemToUI(value) {
    const item = createNewItem(value, false);
    // add to UI
    const addToUp = toggleBtn.classList.contains("rotate-180");
    if (addToUp) {
        list.insertAdjacentElement("afterbegin", item);
    }
    else {
        list.appendChild(item);
    }
    // Replace empty list with new list
    replaceListAndEmpty(list);
}
/* ------------------------------ Filter Items ------------------------------ */
function filterItems() {
    const allItems = list.querySelectorAll("#item");
    const value = filterInput.value.toLowerCase();
    allItems.forEach((item) => {
        var _a, _b;
        const itemContext = (_b = (_a = item.firstChild) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        if (!itemContext.includes(value)) {
            item.classList.add("hidden");
        }
        else {
            item.classList.remove("hidden");
        }
    });
}
/* ------------------------------ clearAllItems ----------------------------- */
function clearAll() {
    updateListUI("empty");
    replaceListAndEmpty(emptyInfo);
    setStorageItemsTo([]);
    closeDialog();
}
/* ------------------------------ UI Actions ------------------------------ */
function updateListUI(state) {
    if (state === "empty") {
        filterInput.classList.add("hidden");
        clearBtn.setAttribute("disabled", "true");
    }
    else if (state === "non-empty") {
        filterInput.classList.remove("hidden");
        clearBtn.removeAttribute("disabled");
    }
}
/* ------------------------- Replace Project Content ------------------------ */
function replaceListAndEmpty(element) {
    shopContainer.replaceChild(element, shopContainer.firstElementChild);
}
function updateUIOfActions() {
    const items = list.querySelectorAll("#item");
    // it must be reacreated every time it's called because we have to know current state of items
    if (items.length === 0)
        updateListUI("empty");
    else if (items.length === 1)
        updateListUI("non-empty");
    // if form has changed into update mode
    if (submitBtn.classList.contains("bg-green-500")) {
        submitBtn.classList.replace("bg-green-500", "bg-black/80");
        submitBtn.textContent = "+ Add Item";
    }
}
function displayItems() {
    const storageItems = getItemsFromStorage();
    if (storageItems.length > 0) {
        storageItems.forEach(({ text, completed }) => {
            const newItem = createNewItem(text, completed);
            list.appendChild(newItem);
        });
        replaceListAndEmpty(list);
    }
}
/* ----------------------------- Event Listeners ---------------------------- */
function initApp() {
    toggleBtn.addEventListener("click", toggleButton);
    list.addEventListener("click", onClick);
    form.addEventListener("submit", handleSubmit);
    clearBtn.addEventListener("click", openDialog.bind(null, clearBtn, "clearAll"));
    filterInput.addEventListener("input", filterItems);
    displayItems();
    updateUIOfActions();
}
initApp();
