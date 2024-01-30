const form = document.querySelector("form") as HTMLFormElement;
const addItemInput = form.querySelector("input") as HTMLInputElement;
const shopContainer = document.querySelector(".items") as HTMLDivElement;
const toggleBtn = document.querySelector("#toggle") as HTMLButtonElement;
const emptyInfo = shopContainer.querySelector("h4") as HTMLHeadingElement;
const filterInput = document.querySelector("#filter-input") as HTMLInputElement;
const clearBtn = document.querySelector("#clear") as HTMLButtonElement;
const modal = document.querySelector("#modal") as HTMLDivElement;

const list = createElement("ul") as HTMLUListElement;
list.setAttribute("id", "items-list");
list.className = "p-2 grid gap-2 font-bold";

/* ------------------ Add item to top or bottom of the list ----------------- */

const toggleButton = () => toggleBtn.classList.toggle("rotate-180");

/* -------------------------- Creating New Element -------------------------- */

function createElement(tag: keyof HTMLElementTagNameMap, className?: string) {
  const element = document.createElement(tag);
  if (tag === "button") element.setAttribute("type", "button");
  return element;
}

/* ------------------------- Creating new list item ------------------------- */

function createNewItem(value: string) {
  // <li> item
  const newItem = createElement("li") as HTMLLIElement;
  newItem.setAttribute("id", "item");
  newItem.className = "p-2 flex items-center justify-between border-2 border-black/30 rounded-md";

  // <span> text
  const text = createElement("span");
  text.textContent = value;

  // <div> <buttons> </div>
  const allBtns = createElement("div") as HTMLDivElement;
  allBtns.className = "flex gap-2 bg-gray-300 rounded-md p-1 items-center";
  const remBtn = createElement("button") as HTMLButtonElement;
  remBtn.textContent = "❌";
  remBtn.setAttribute("id", "remove");
  const editBtn = createElement("button") as HTMLButtonElement;
  editBtn.textContent = "➕";
  editBtn.setAttribute("id", "edit");

  const doneBtn = createElement("input") as HTMLInputElement;
  doneBtn.type = "checkbox";
  doneBtn.className = "w-5 h-5";
  allBtns.appendChild(doneBtn);

  [
    { id: "edit", el: editBtn },
    { id: "remove", el: remBtn },
  ].forEach(({ el: btn, id }) => {
    btn.setAttribute("id", id);

    allBtns.appendChild(btn);
  });

  newItem.appendChild(text);
  newItem.appendChild(allBtns);

  return newItem;
}

/* ------------------------- Get items from storage ------------------------- */
function getItemsFromStorage(): string[] {
  return JSON.parse(localStorage.getItem("items") || "[]");
}

/* ------------------------------- Remove Item ------------------------------- */
function removeItem(element: HTMLElement, text: string) {
  element.remove();

  const filtered = getItemsFromStorage().filter((item) => item !== text);

  if (list.children.length === 0) {
    replaceListAndEmpty(emptyInfo);
  }
  localStorage.setItem("items", JSON.stringify(filtered));
  updateActions();
}

/* ------------------------------- Done Item ------------------------------- */
function checkItem(element: HTMLElement) {
  console.log(element);

  element.classList.toggle("line-through");
  element.classList.toggle("font-normal");
  element.classList.toggle("opacity-50");
}

function openDialog(element: HTMLElement, type: "remove" | "edit", text: string) {
  modal.classList.replace("opacity-0", "opacity-100");
  modal.classList.replace("pointer-events-none", "pointer-events-auto");

  const dialog = document.querySelector("#back-drop") as HTMLDivElement;

  Array.from(dialog.children).forEach((child) => (child.getAttribute("id") !== type ? child.classList.add("hidden") : null));

  console.log(dialog.firstElementChild);

  dialog.addEventListener("click", deleteItem);

  function deleteItem(e: MouseEvent) {
    const clicked = e.target as HTMLButtonElement;

    const success = clicked.getAttribute("id") === "yes";

    if (clicked.nodeName === "BUTTON" && text) {
      if (success) {
        removeItem(element, text);
      }
      closeDialog();
    }
  }
}

function closeDialog() {
  modal.classList.replace("opacity-100", "opacity-0");
  modal.classList.replace("pointer-events-auto", "pointer-events-none");

  const dialog = document.querySelector("#back-drop") as HTMLDivElement;

  Array.from(dialog.children).forEach((child) => child.classList.add("hidden"));
}

function addActionstoBtn(e: MouseEvent) {
  const clickedBtn = e.target as HTMLButtonElement;
  const parent = clickedBtn.closest("li") as HTMLLIElement;
  const text = parent.querySelector("span") as HTMLSpanElement;

  switch (clickedBtn.getAttribute("id")) {
    case "remove":
      openDialog(parent, "remove", text.textContent!);
      break;
    case "edit":
      // removeItem(parent, text.textContent!);
      openDialog(parent, "edit", text.textContent!);
      break;
    case "done":
      checkItem(text);
      break;
  }
}

/* ------------------------- Replace Project Content ------------------------ */
const replaceListAndEmpty = (element: HTMLElement) => shopContainer.replaceChild(element, shopContainer.firstElementChild as Node);

/* ------------------------------- Form Submit ------------------------------ */
function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  const value = addItemInput.value.trim();

  if (!value) {
    return alert("Please enter a value");
  } else if (getItemsFromStorage().includes(value)) {
    return alert("Item already exists");
  } else {
    // Add to UI and storage
    addItemToUI(value);
    // Add to  storage
    addItemToStorage(value);

    // Clear and focus input
    addItemInput.value = "";
    addItemInput.focus();

    // replaceListAndEmpty
    updateActions();
  }
}

function addItemToUI(value: string) {
  const item = createNewItem(value);

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

function addItemToStorage(value: string) {
  const items = getItemsFromStorage();
  items.push(value);

  localStorage.setItem("items", JSON.stringify(items));
}

/* ------------------------------ clearAllItems ----------------------------- */

const clearAll = () => replaceListAndEmpty(emptyInfo);

/* ------------------------------ Filter Items ------------------------------ */
function filterItems(e: InputEvent) {
  const allItems = list.querySelectorAll("#item") as NodeListOf<HTMLLIElement>;
  const value = (e.target as HTMLInputElement).value.toLowerCase();

  allItems.forEach((item) => {
    const itemContext = item.firstChild?.textContent?.toLowerCase()!;

    if (!itemContext.includes(value)) {
      item.classList.add("hidden");
    } else {
      item.classList.remove("hidden");
    }
  });

  e.target as HTMLInputElement;
}

/* ------------------------------ UI Actions ------------------------------ */
function emptyListUI() {
  clearBtn.setAttribute("disabled", "true");
  filterInput.classList.add("hidden");
}

function nonEmptyListUI() {
  console.log("chagirildi");

  filterInput.classList.remove("hidden");
  clearBtn.removeAttribute("disabled");
}

function updateActions() {
  const items = list.querySelectorAll("#item") as NodeListOf<HTMLLIElement>;
  // it must be reacreated every time it's called because we have to know current state of items
  if (items.length === 0) emptyListUI();
  else if (items.length === 1) nonEmptyListUI();
}

function displayItems() {
  const storageItems = getItemsFromStorage();

  if (storageItems.length > 0) {
    storageItems.forEach((item) => {
      list.appendChild(createNewItem(item));
    });
    replaceListAndEmpty(list);
  }
}

/* ----------------------------- Event Listeners ---------------------------- */

function initApp() {
  toggleBtn.addEventListener("click", toggleButton);

  list.addEventListener("click", addActionstoBtn);

  form.addEventListener("submit", handleSubmit);
  clearBtn.addEventListener("click", clearAll);
  // filterInput.addEventListener("input", filterItems);

  displayItems();
  updateActions();
}

initApp();
