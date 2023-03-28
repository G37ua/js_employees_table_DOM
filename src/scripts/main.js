'use strict';

const body = document.querySelector('body');
const table = document.querySelector('table');
const headers = table.querySelectorAll('th');
const tBodies = table.querySelector('tbody');

let selectedRow = null;
let activeCell = null;

const directions = Array.from(headers).map(function(header) {
  return '';
});

headers.forEach(header => {
  header.addEventListener('click', () => {
    const index = header.cellIndex;
    const rows = table.tBodies[0].querySelectorAll('tr');
    const rowsArray = [...rows];

    const direction = directions[index] || 'asc';

    const multiplier = (direction === 'asc') ? 1 : -1;

    rowsArray.sort((a, b) => {
      const cellA = a.querySelectorAll('td')[index].textContent;
      const cellB = b.querySelectorAll('td')[index].textContent;

      function num(str) {
        const hasDigits = /\d/.test(str);

        return hasDigits ? +str.replace(/\D/g, '') : str;
      };

      switch (true) {
        case num(cellA) > num(cellB): return 1 * multiplier;
        case num(cellA) < num(cellB): return -1 * multiplier;
        case num(cellA) === num(cellB): return 0;
      }
    });

    directions[index] = direction === 'asc' ? 'desc' : 'asc';

    rowsArray.forEach(row => {
      table.tBodies[0].appendChild(row);
    });
  });
});

tBodies.addEventListener('click', (e) => {
  const tr = e.target.closest('tr');

  if (!tr) {
    return;
  };

  if (!table.contains(tr)) {
    return;
  };

  if (selectedRow) {
    selectedRow.classList.remove('active');
  }
  selectedRow = tr;
  tr.classList.add('active');
});

table.insertAdjacentHTML('afterend', `
  <form class="new-employee-form">
    <label>
      Name:
        <input
          name="name"
          type="text"
          data-qa="name"
          placeholder="Joe Black"
        >
    </label>

    <label>
      Position:
        <input
          name="position"
          type="text"
          data-qa="position"
          placeholder="Employee position"
        >
    </label>

    <label>
      Office:
      <select name="office" data-qa="office"
      required>
        <option value="Tokyo">Tokyo</option>
        <option value="Singapore">Singapore</option>
        <option value="London">London</option>
        <option value="New York">New York</option>
        <option value="Edinburgh">Edinburgh</option>
        <option value="San Francisco">San Francisco</option>
      </select>
    </label>

    <label>
      Age:
        <input
          name="age"
          type="number"
          data-qa="age"
          placeholder="Employee age"
        >
    </label>

    <label>
      Salary:
        <input
          name="salary"
          type="number"
          data-qa="salary"
          placeholder="Employee salary"
        >
    </label>

    <button type="submit" class="validate__btn" value="Submit">
      Save to table
    </button>
  </form>`);

const pushNotification = ({ title, description, type }) => {
  const message = document.createElement('div');

  message.innerHTML = `
  <div class="notification ${type}" data-qa="notification">
    <h2 class = "title">${title}</h2>
    <p>${description}</p>
  </div>
  `;

  body.append(message);
  setTimeout(() => message.remove(), 2000);
};

const wrong = {
  title: 'Wrong!',
  description: 'All form fields must be completed',
  type: 'error',
};

const wrongName = {
  title: 'Wrong Name!',
  description: 'The name must contain 4 to 30 letters!',
  type: 'error',
};

const wrongPosition = {
  title: 'Wrong Position name!',
  description: 'The position name should have more than 2 letters!',
  type: 'error',
};

const wrongAge = {
  title: 'Wrong Age!',
  description: 'The employee must be over 18 and under 90!',
  type: 'error',
};

const wrongSalary = {
  title: 'Wrong Salary!',
  description: 'The salary should be a positive number!',
  type: 'error',
};

const success = {
  title: 'Success!',
  description: 'A new employee was added to the table!',
  type: 'success',
};

const form = document.querySelector('.new-employee-form');
const formInputs = form.querySelectorAll('input');
const nameInput = form.querySelector('[data-qa="name"]');
const position = form.querySelectorAll('[data-qa="position"]');
const age = form.querySelector('[data-qa="age"]');
const salary = form.querySelector('[data-qa="salary"]');
const salaryReg = /^\d{1,}$/;
const nameReg = /^[a-zA-Z ]{4,30}$/;
const positionReg = /^[a-zA-Z ]{2,50}$/;

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const tr = document.createElement('tr');
  const cols = ['name', 'position', 'office', 'age', 'salary'];
  const nameVal = nameInput.value;
  const positionVal = position.value;
  const ageVal = parseInt(age.value);
  const salaryVal = salary.value;

  for (let i = 0; i < formInputs.length; i++) {
    if (!formInputs[i].value) {
      pushNotification(wrong);

      return;
    }
  }

  if (!nameReg.test(nameVal)) {
    pushNotification(wrongName);

    return;
  }

  if (!positionReg.test(positionVal)) {
    pushNotification(wrongPosition);
  }

  if (ageVal <= 18 || ageVal >= 90) {
    pushNotification(wrongAge);

    return;
  }

  if (!salaryReg.test(salaryVal)) {
    pushNotification(wrongSalary);

    return;
  }

  for (let q = 0; q < cols.length; ++q) {
    const tdCell = document.createElement('td');

    tdCell.textContent = document.getElementsByName(cols[q])[0].value;

    if (cols[q] === 'salary') {
      tdCell.textContent = `$`
        + document.getElementsByName(cols[q])[0].value
          .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    tr.appendChild(tdCell);
  }

  document.querySelector('table tbody').appendChild(tr);

  pushNotification(success);

  document.querySelector('form').reset();
});

table.addEventListener('dblclick', (e) => {
  const td = e.target.closest('td');

  if (!td) {
    return;
  };

  if (!table.contains(td)) {
    return;
  };

  editor(td);
});

function editor(cell) {
  if (activeCell) {
    return;
  }

  activeCell = cell;
  activeCell.setAttribute('data-original-value', activeCell.innerHTML);

  const input = document.createElement('input');

  input.classList.add('cell-input');
  input.value = activeCell.innerHTML;
  activeCell.innerHTML = '';
  activeCell.appendChild(input);

  input.addEventListener('blur', function() {
    const value = input.value.trim();

    if (value === '') {
      activeCell.innerHTML = activeCell.getAttribute('data-original-value');
    } else {
      activeCell.innerHTML = value;
    }
    activeCell.removeAttribute('data-original-value');
    input.removeEventListener('blur', saveChanges);
    activeCell = null;
  });

  function saveChanges(inPut) {
    const value = inPut.value.trim();

    if (value === '') {
      activeCell.innerHTML = activeCell.getAttribute('data-original-value');
    } else {
      activeCell.innerHTML = value;
    }
    activeCell.removeAttribute('data-original-value');
    inPut.removeEventListener('blur', saveChanges);
    activeCell = null;
  }
}
