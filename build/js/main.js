"use strict";
const form = document.querySelector("form");
const addItemInput = form.querySelector("input");
const toggleBtn = document.querySelector("#toggle");
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
function updateItemOfStorage(text) {
    const updated = getItemsFromStorage().map((item) => (item.text === text ? { completed: !item.completed, text } : item));
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
    const classNames = ["line-through", "font-normal", "opacity-50"];
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
            // case "update":
            //   editItem(e);
            //   break;
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
    // function editItem(e: MouseEvent) {
    //   content.focus();
    //   const input = content.querySelector("input") as HTMLInputElement;
    //   input.value = element.textContent!;
    // }
}
function closeDialog() {
    modal.classList.replace("opacity-100", "opacity-0");
    modal.classList.replace("pointer-events-auto", "pointer-events-none");
    modal.querySelectorAll("aside").forEach((aside) => {
        aside.classList.replace("opacity-100", "opacity-0");
        aside.classList.replace("pointer-events-auto", "pointer-events-none");
    });
}
let editMode = false;
/* ------------------------------- Edit Item ------------------------------- */
function editItem(element, value) {
    editMode = true;
    list.querySelectorAll("#item").forEach((item) => item.classList.remove("opacity-50"));
    element.classList.add("opacity-50");
    const formSubmitBtn = form.querySelector("button[type='submit']");
    formSubmitBtn.classList.replace("bg-black/80", "bg-green-500");
    formSubmitBtn.textContent = "Update";
    const span = element.firstChild;
    addItemInput.value = span.textContent;
    // formSubmitBtn.addEventListener("click", (e: MouseEvent) => {
    //   e.preventDefault();
    //   span.textContent = addItemInput.value;
    //   addItemInput.value = "";
    //   element.classList.remove("opacity-50");
    //   formSubmitBtn.classList.replace("bg-green-500", "bg-black/80");
    //   formSubmitBtn.textContent = "+ Add Item ";
    //   editMode = false;
    // });
}
function onClick(e) {
    var _a, _b;
    const clicked = e.target;
    const itemIsClicked = clicked.nodeName === "LI" || clicked.nodeName === "SPAN";
    const buttonIsClicked = clicked.nodeName === "BUTTON";
    const checkboxIsClicked = clicked.nodeName === "INPUT";
    if (itemIsClicked) {
        editItem(clicked, clicked.firstChild.textContent);
    }
    else if (buttonIsClicked) {
        const parent = clicked.closest("li");
        switch (clicked.getAttribute("id")) {
            case "remove":
                openDialog(parent, "remove");
                break;
            case "update":
                openDialog(parent, "update");
                break;
        }
    }
    if (checkboxIsClicked) {
        const element = (_b = (_a = clicked.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.firstChild;
        updateItemOfStorage(element.textContent);
        markItemAsCompleted(element);
    }
}
/* ------------------------------- Form Submit ------------------------------ */
function handleSubmit(e) {
    e.preventDefault();
    const storageItems = getItemsFromStorage().map((item) => item.text);
    const value = addItemInput.value.trim();
    if (!value) {
        return alert("Please enter a value");
    }
    else if (storageItems.includes(value)) {
        return alert("Item already exists");
    }
    else {
        if (editMode) {
            removeItemFromStorage(value);
            const item = list.querySelector(".opacity-50");
            console.log(item);
            removeItem(item);
            const btn = form.querySelector("button[type='submit']");
            btn.classList.replace("bg-green-500", "bg-black/80");
            btn.textContent = "+ Add Item";
            editMode = false;
        }
        // Add to UI and storage
        addItemToUI(value);
        // Add to  storage
        addItemToStorage(value);
        // Clear and focus input
        addItemInput.value = "";
        addItemInput.focus();
        // replaceListAndEmpty
        updateUIOfActions();
    }
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
/* ------------------------------ clearAllItems ----------------------------- */
function clearAll() {
    updateListUI("empty");
    replaceListAndEmpty(emptyInfo);
    setStorageItemsTo([]);
    closeDialog();
}
/* ------------------------------ Filter Items ------------------------------ */
function filterItems(e) {
    const allItems = list.querySelectorAll("#item");
    const value = e.target.value.toLowerCase();
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
/* ------------------------------ UI Actions ------------------------------ */
// function emptyListUI() {
//   filterInput.classList.add("hidden");
//   clearBtn.setAttribute("disabled", "true");
// }
// function nonEmptyListUI() {
//   filterInput.classList.remove("hidden");
//   clearBtn.removeAttribute("disabled");
// }
function updateListUI(state) {
    switch (state) {
        case "empty":
            filterInput.classList.add("hidden");
            clearBtn.setAttribute("disabled", "true");
            break;
        /* ---------------------------------------------------------------------- */
        case "non-empty":
            filterInput.classList.remove("hidden");
            clearBtn.removeAttribute("disabled");
            break;
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
    // filterInput.addEventListener("input", filterItems);
    displayItems();
    updateUIOfActions();
}
initApp();
