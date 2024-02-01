const form = document.querySelector("form") as HTMLFormElement;
const addItemInput = form.querySelector("input") as HTMLInputElement;
const toggleBtn = document.querySelector("#toggle") as HTMLButtonElement;
const submitBtn = document.querySelector("button[type='submit']") as HTMLButtonElement;

const filterInput = document.querySelector("#filter-input") as HTMLInputElement;

const shopContainer = document.querySelector(".items") as HTMLDivElement;
const emptyInfo = shopContainer.querySelector("h4") as HTMLHeadingElement;
const clearBtn = document.querySelector("#clear") as HTMLButtonElement;

const modal = document.querySelector("#modal") as HTMLDivElement;

const list = createElement("ul") as HTMLUListElement;
list.setAttribute("id", "items-list");
list.className = "p-2 grid gap-2 font-bold";

/* ------------------ Add item to top or bottom of the list ----------------- */

const toggleButton = () => toggleBtn.classList.toggle("rotate-180");

/* ------------------------- Get, add, and remove items from storage ------------------------- */

function getItemsFromStorage(): { completed: boolean; text: string }[] {
  return JSON.parse(localStorage.getItem("items") || "[]");
}

function setStorageItemsTo(items: { completed: boolean; text: string }[]) {
  localStorage.setItem("items", JSON.stringify(items));
}

function addItemToStorage(text: string) {
  const items = getItemsFromStorage();
  items.push({ completed: false, text });
  setStorageItemsTo(items);
}

function updateItemOfStorage(text: string, checked: boolean, newText?: string) {
  const updated = getItemsFromStorage().map((item) => (item.text === text ? { completed: checked, text: newText ?? item.text } : item));

  setStorageItemsTo(updated);
}

function removeItemFromStorage(text: string) {
  const filtered = getItemsFromStorage().filter((item) => item.text !== text);
  setStorageItemsTo(filtered);
}

/* -------------------------- Creating New Element -------------------------- */

function createElement(tag: keyof HTMLElementTagNameMap, textContent?: string, className?: string) {
  const element = document.createElement(tag);
  if (tag === "button") element.setAttribute("type", "button");
  if (textContent) element.appendChild(document.createTextNode(textContent));
  return element;
}

/* ------------------------- Creating new list item ------------------------- */

function createNewItem(value: string, checked: boolean) {
  // <li> item
  const newItem = createElement("li") as HTMLLIElement;
  newItem.setAttribute("id", "item");
  newItem.className = "p-2 flex items-center justify-between border-2 border-black/30 rounded-md";

  // <span> text
  const text = createElement("span", value);

  if (checked) markItemAsCompleted(text);

  // <div> <input> <buttons> </div>
  const allActions = createElement("div") as HTMLDivElement;
  allActions.className = "flex gap-2 bg-gray-300 rounded-md p-1 items-center";

  // <input> checkbox
  const checkedEl = createElement("input") as HTMLInputElement;
  checkedEl.type = "checkbox";
  checkedEl.className = "w-5 h-5";
  checkedEl.checked = checked || false;

  const editBtn = createElement("button", "🖊") as HTMLButtonElement;
  editBtn.setAttribute("id", "update");

  const remBtn = createElement("button", "❌") as HTMLButtonElement;
  remBtn.setAttribute("id", "remove");

  allActions.appendChild(checkedEl);
  allActions.appendChild(remBtn);
  allActions.appendChild(editBtn);

  newItem.appendChild(text);
  newItem.appendChild(allActions);

  return newItem;
}

/* ------------------------------- Remove Item ------------------------------- */
function removeItem(element: HTMLElement) {
  element.remove();
  const text = (element.querySelector("span") as HTMLSpanElement).textContent as string;
  removeItemFromStorage(text);

  if (list.children.length === 0) replaceListAndEmpty(emptyInfo);
  updateUIOfActions();
}

/* ------------------------- Mark Item as Completed ------------------------- */
function markItemAsCompleted(element: HTMLSpanElement) {
  const classNames = ["line-through", "font-normal", "opacity-40"];
  classNames.forEach((className) => element.classList.toggle(className));
}

/* ------------------------ Open Modal Before Delete ------------------------ */
function openDialog(element: HTMLElement, type: "remove" | "update" | "clearAll") {
  let content = modal.querySelector(`#${type}`) as HTMLDivElement;
  if (type === "clearAll") content = modal.querySelector(`#remove`) as HTMLDivElement;

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

  function deleteItem(e: MouseEvent) {
    const clicked = e.target as HTMLButtonElement;

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
function setItemToEdit(element: HTMLLIElement) {
  editMode = true;

  submitBtn.classList.replace("bg-black/80", "bg-green-500");
  submitBtn.textContent = "Update";

  list.querySelectorAll("#item").forEach((item) => item.classList.remove("opacity-50"));
  // we need to remove opacity-50 from all items before adding it to the new item
  element.classList.add("opacity-50");

  const span = element.firstElementChild as HTMLSpanElement;
  addItemInput.value = span.textContent as string;
}

function onClick(e: MouseEvent) {
  const clicked = e.target as HTMLLIElement | HTMLSpanElement | HTMLButtonElement | HTMLInputElement;

  const isButtonClicked = clicked.nodeName === "BUTTON";
  const isCheckboxClicked = clicked.nodeName === "INPUT";

  const mainElement = clicked.closest("li") as HTMLLIElement;

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
  } else if (isCheckboxClicked) {
    const element = clicked.parentElement?.previousElementSibling as HTMLSpanElement;
    const input = clicked as HTMLInputElement;

    updateItemOfStorage(element.textContent as string, input.checked);
    markItemAsCompleted(element);
  }
}

/* ------------------------------- Form Submit ------------------------------ */
function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  const storageItems = getItemsFromStorage().map(({ text }) => text);

  const value = addItemInput.value.trim();

  if (!value) {
    return alert("Please enter a value");
  } else if (storageItems.includes(value)) {
    return alert("Item already exists");
  } else if (editMode) {
    const item = list.querySelector(".opacity-50")?.querySelector("span") as HTMLSpanElement;

    updateItemOfStorage(item.innerText, false, value);
    item.innerText = value;

    (item.parentElement as HTMLLIElement).classList.remove("opacity-50");
    editMode = false;
  } else {
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

function addItemToUI(value: string) {
  const item = createNewItem(value, false);

  // add to UI
  const addToUp = toggleBtn.classList.contains("rotate-180");

  if (addToUp) {
    list.insertAdjacentElement("afterbegin", item);
  } else {
    list.appendChild(item);
  }

  // Replace empty list with new list
  replaceListAndEmpty(list);
}

/* ------------------------------ Filter Items ------------------------------ */
function filterItems() {
  const allItems = list.querySelectorAll("#item") as NodeListOf<HTMLLIElement>;
  const value = filterInput.value.toLowerCase();

  allItems.forEach((item) => {
    const itemContext = item.firstChild?.textContent?.toLowerCase()!;

    if (!itemContext.includes(value)) {
      item.classList.add("hidden");
    } else {
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

function updateListUI(state: "empty" | "non-empty") {
  if (state === "empty") {
    filterInput.classList.add("hidden");
    clearBtn.setAttribute("disabled", "true");
  } else if (state === "non-empty") {
    filterInput.classList.remove("hidden");
    clearBtn.removeAttribute("disabled");
  }
}

/* ------------------------- Replace Project Content ------------------------ */
function replaceListAndEmpty(element: HTMLUListElement | HTMLHeadingElement) {
  shopContainer.replaceChild(element, shopContainer.firstElementChild as HTMLUListElement | HTMLHeadingElement);
}

function updateUIOfActions() {
  const items = list.querySelectorAll("#item") as NodeListOf<HTMLLIElement>;
  // it must be reacreated every time it's called because we have to know current state of items
  if (items.length === 0) updateListUI("empty");
  else if (items.length === 1) updateListUI("non-empty");

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
