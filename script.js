const url = `http://localhost:3000/users`;

const name = document.getElementById('name');
const surname = document.getElementById('surname');
const age = document.getElementById('age');
const email = document.getElementById('email');

const searchName = document.getElementById('search-name');
const searchSurname = document.getElementById('search-surname');
const searchAge = document.getElementById('search-age');

const loadingContainer = document.getElementById('loading-container');
const progressValue = document.getElementById('progres-value');
const progressBar = document.getElementById('progres');
const createBtr = document.getElementById('create-button');



async function main () {
    const users = await getUsers();

    checkEmptyField(name, ".error-message");
    checkEmptyField(surname, ".error-message");
    checkEmptyField(age, ".error-message");
    checkEmptyField(email, ".error-message");

    if (!checkAge(age, ".error-message") || !(await checkEmail(email, ".error-message"))) {
        return;
    }

    addUserDB();

    loading(users);

    clearForm(name);
    clearForm(surname);
    clearForm(age);
    clearForm(email);
    clearForm(searchName);
    clearForm(searchSurname);
    clearForm(searchAge);
}

function displayUsers (userArr) {
    const userList = document.getElementById('right-main');
    userList.innerHTML = '';

    userArr.map((user, index) => {
        return (userList.innerHTML += `<div class="right-main-items">
                <p class="for-position-id">${index + 1}</p>
                <p>${user.name}</p>
                <p>${user.surname}</p>
                <p>${user.age}</p>
                <p>${user.email[0].toUpperCase()}..@gmail</p>
                <button class="delete" onclick="deleteUser('${user.id}')">Delete</button>
                <button class="edit" onclick="editUser('${user.id}')">Edit</button>
            </div>`);
    })
}
 
function addUserDB() {
    const user = createUser();
    createUserRequest(user);
}

function createUser() {
    const user = {
        name: name.value.replace(name.value[0], 
              name.value[0].toUpperCase()),
        surname: surname.value.replace(surname.value[0], 
                 surname.value[0].toUpperCase()),
        age: age.value,
        email: email.value
    };
    return user;
}

async function createUserRequest(user) {
    const req = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
    return await req.json();
}

async function getUsers() {
    const req = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await req.json();
}

async function checkEmail(inputEmail, selector, currentIndex) {
    const users = await getUsers()
    let isValid = true;
    let errorMessage = inputEmail.parentNode.querySelector(selector);

    users.forEach((user, index) => {
        if (index !== currentIndex && user.email === inputEmail.value) {
            errorMessage.textContent = "Email exists";
            isValid = false;
        } else {
            errorMessage.textContent = '';
        }
    });

    return isValid;
}

function checkAge (inputAge, selector) {
    const errorMessage = inputAge.parentNode.querySelector(selector);

    if (inputAge.value <= 5 || inputAge.value >= 138) {
        errorMessage.textContent = "Invalid age.";
        return false;
    } else {
        errorMessage.textContent = "";
    }

    return true;
}

async function sortByValue () {
    const users = await getUsers();

    const nameValue = searchName.value.toLowerCase();
    const surnameValue = searchSurname.value.toLowerCase();
    const ageValue = searchAge.value.toLowerCase();

    if (nameValue || surnameValue || ageValue) {
        filteredUsers = users.filter(user => {
            const name = user.name.toLowerCase().includes(nameValue);
            const surname = user.surname.toLowerCase().includes(surnameValue);
            const age = user.age.includes(ageValue);
            return name && surname && age;
        })
        if (filteredUsers.length === 0) {
            const userList = document.getElementById("right-main");
            userList.innerHTML = "<p>no matches</p>";
        } else {
            displayUsers(filteredUsers);
        }  
    } else {
        displayUsers(users);
    }
}

async function deleteUser(id) {
    await fetch(`${url}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const users = await getUsers();
    displayUsers(users);
}

async function getUserById(id) {
    let users = await getUsers();
    let user = users.find(user => user.id === id);
  
    return user;
}
  
async function editUser(id) {
    const user = await getUserById(id);
    const userItem = document.querySelector(".right-main-items");
    const userFields = userItem.querySelectorAll("p");

    const edit = setInterval(() => {
        userFields[1].innerHTML = `<input onfocusout="checkEmptyField(this, '.error-message')" class="change-input" type="text" value="${user.name}">
                                        <p class="error-message"></p>`;
        userFields[2].innerHTML = `<input onfocusout="checkEmptyField(this, '.error-message')" class="change-input" type="text" value="${user.surname}">
                                        <p class="error-message"></p>`;
        userFields[3].innerHTML = `<input onfocusout="checkEmptyField(this, '.error-message')" class="change-input" type="text" value="${user.age}">
                                        <p class="error-message"></p>`;
        userFields[4].innerHTML = `<input onfocusout="checkEmptyField(this, '.error-message')" class="change-input" type="text" value="${user.email}">
                                        <p class="error-message"></p>`;

        const saveButton = document.createElement("button");
        saveButton.className = "save";
        saveButton.textContent = "Save";
        saveButton.onclick = () => saveChanges(id, userFields, userItem);

        userItem.appendChild(saveButton);
        userItem.querySelector(".delete").style.display = "none";
        userItem.querySelector(".edit").style.display = "none";
        clearInterval(edit);
    }, 500)
}

async function saveChanges(id, userFields, userItem) {
    const  users = await getUsers();
    const  nameInput = userFields[1].querySelector("input");
    const  surnameInput = userFields[2].querySelector("input");
    const  ageInput = userFields[3].querySelector("input");
    const  emailInput = userFields[4].querySelector("input");

    let updatedUser = {
        id: id,
        name: nameInput.value.replace(
              nameInput.value[0],
              nameInput.value[0].toUpperCase()
        ),
        surname: surnameInput.value.replace(
                 surnameInput.value[0],
                 surnameInput.value[0].toUpperCase()
        ),
        age: ageInput.value,
        email: emailInput.value,
    };


    const save = setInterval(async () => { 
        await updateUserRequest(updatedUser);
        displayUsers(users);

        userItem.querySelector(".delete").style.display = "inline-block";
        userItem.querySelector(".edit").style.display = "inline-block";
        clearInterval(save);
    }, 500)
    
}

async function updateUserRequest(user) {
    await fetch(`${url}/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    });
}
  
function checkEmptyField(inputElement, selector) {
    const errorMessage = inputElement.parentNode.querySelector(selector);
    let isValid = false;

    if (inputElement.value.trim() === '') {
        errorMessage.textContent = "Must be filled.";
        isValid = false;
    } else {
        isValid = true;
        errorMessage.textContent = '';
    }
    return isValid;
}

function clearForm (arg) {
    return arg.value = '';
}

function loading(userArr) {
    let startValue = 0;
    let endValue = 100;
    createBtr.style.display = "none";
    loadingContainer.style.display = 'flex';

    const progress = setInterval(() => {
        startValue++;
        progressValue.textContent = `${startValue}%`;
        progressBar.style.background = `conic-gradient(#7d2ae8 ${startValue * 3.6}deg, #ededed 0deg)`;

        if (startValue === endValue) {
            clearInterval(progress);
            displayUsers(userArr);
            loadingContainer.style.display = 'none';
            createBtr.style.display = "flex";
        }
    }, 20);
}