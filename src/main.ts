const addItemInput = document.querySelector("form input") as HTMLInputElement;
const form = document.querySelector("form") as HTMLFormElement;
const shopList = document.querySelector(".items") as HTMLDivElement;
const clearBtn = document.querySelector("#clear") as HTMLButtonElement;

// clearBtn.classList.add("disabled");

/* -------------------------------------------------------------------------- */
/*                    Add item to top or bottom of the list                   */
/* -------------------------------------------------------------------------- */

const toggleBtn = document.querySelector("#toggle") as HTMLButtonElement;

function toggleButton(e: MouseEvent) {
  console.log("saw");

  const isUp = toggleBtn.textContent === "⬆";
  toggleBtn.textContent = isUp ? "⬇" : "⬆";
  toggleBtn.setAttribute("data-direction", isUp ? "down" : "up");
}

toggleBtn.addEventListener("click", toggleButton);

/* -------------------------- Creating New Element -------------------------- */

function createElement(tag: keyof HTMLElementTagNameMap) {
  return document.createElement(tag);
}

/* -------------------------------------------------------------------------- */
/*                           Creating new list item                           */
/* -------------------------------------------------------------------------- */

function createButtonsOfItem(label: string) {
  const remBtn = createElement("button") as HTMLButtonElement;
  remBtn.textContent = label;

  remBtn.addEventListener("click", (e: MouseEvent) => {
    console.log("clicked on remove button");
  });

  return remBtn;
}

function createNewItem(value: string) {
  // li item
  const newItem = createElement("li") as HTMLLIElement;
  newItem.setAttribute("id", "item");
  newItem.className = "p-2 flex items-center justify-between border-2 border-black/30 rounded-md";

  // span text
  const text = createElement("span");
  text.textContent = value;

  /* --------------------------------- Buttons -------------------------------- */
  const allBtns = createElement("div") as HTMLDivElement;

  allBtns.className = "flex gap-2 bg-gray-300 rounded-md p-1";

  const remBtn = createElement("button") as HTMLButtonElement;
  remBtn.textContent = "❌";

  const editBtn = createElement("button") as HTMLButtonElement;
  editBtn.textContent = "➕";

  const doneBtn = createElement("button") as HTMLButtonElement;
  doneBtn.textContent = "✔";

  allBtns.addEventListener("click", (e: MouseEvent) => {
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

let allValues = localStorage.getItem("list") ? JSON.parse(localStorage.getItem("list")) : ([] as string[]);

function handleSubmit(e: SubmitEvent) {
  e.preventDefault();

  const value = addItemInput.value;

  if (!value) {
    return alert("Please enter a value");
  }

  // Select list or create if there is no list yest
  let list = document.querySelector("#items-list") ?? null;

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
