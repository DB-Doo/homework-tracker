let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function updateCalendar() {
  let monthYear = document.getElementById("month-year");
  monthYear.textContent = `${currentMonth + 1}-${currentYear}`;

  let firstDay = new Date(currentYear, currentMonth).getDay();
  let daysOfMonth = daysInMonth(currentMonth, currentYear);

  let calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = ""; // Clear existing calendar

  let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // firstDayOfMonth is 0 (Sunday) to 6 (Saturday)

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      let cell = document.createElement("td");

      if (i === 0 && j < firstDayOfMonth) {
        // Before the start of the month, leave these cells empty
        cell.appendChild(document.createTextNode(""));
      } else if (date > daysOfMonth) {
        // After the end of the month, stop creating cells
        break;
      } else {
        // Fill the cell with the date and any other content
        cell.appendChild(document.createTextNode(date));
        // ... code for adding homework indicators ...

        date++;
      }
      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }

  // Attach click event listeners to each day
  document.querySelectorAll("#calendar-body td").forEach((cell) => {
    cell.addEventListener("click", function () {
      displayHomeworkForDay(cell);
    });
  });

  // Display homework
  displayHomework();
}

function displayHomework() {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  homeworks.forEach((hw) => {
    // Parse the date in local time zone
    let dateComponents = hw.dueDate.split('-');
    let dueDate = new Date(dateComponents[0], dateComponents[1] - 1, dateComponents[2]);

    if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
      let dayOfMonth = dueDate.getDate();
      let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      
      let cellIndex = dayOfMonth + firstDayOfMonth - 1;
      let row = Math.floor(cellIndex / 7) + 1;
      let column = (cellIndex % 7) + 1;

      let targetCell = document.querySelector(`#calendar-body tr:nth-child(${row}) td:nth-child(${column})`);
      if (targetCell && targetCell.textContent.trim() === dayOfMonth.toString()) {
        let hwMarker = document.createElement("div");
        hwMarker.textContent = hw.title;
        hwMarker.className = "homework-marker";
        targetCell.appendChild(hwMarker);
      }
    }
  });
}





function displayHomeworkForDay(cell) {
  // Declare displayDiv at the start of the function
  let displayDiv = document.getElementById('homework-display');

  // Hide existing display if it exists
  if (displayDiv) {
    displayDiv.style.display = 'none'; 
  } else {
    // Create displayDiv if it doesn't exist
    displayDiv = document.createElement('div');
    displayDiv.id = 'homework-display';
    document.body.appendChild(displayDiv);
  }
  
  let day = parseInt(cell.textContent);
  if (!day) return; // Exit if the cell doesn't represent a day of the month

  let clickedDate = new Date(currentYear, currentMonth, day);
  let dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;

  let homeworks = JSON.parse(localStorage.getItem('homeworks')) || [];
  let dueHomeworks = homeworks.filter(hw => hw.dueDate === dateStr);

  if (dueHomeworks.length === 0) {
    return; // No homework for this day, so don't show the box
  }

  displayDiv.innerHTML = ''; // Clear existing content

  // Add homework details to the display
  dueHomeworks.forEach(hw => {
    let hwDiv = document.createElement('div');
    hwDiv.classList.add('homework-item');
    hwDiv.innerHTML = `<strong>${hw.title}</strong>: <span class='editable' contenteditable='true'>${hw.details}</span>`;

    // Create delete button
    let deleteBtn = document.createElement('span');
    deleteBtn.textContent = ' X';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.display = 'none'; // Initially hidden

    // Show delete button on hover
    hwDiv.onmouseenter = () => deleteBtn.style.display = 'inline';
    hwDiv.onmouseleave = () => deleteBtn.style.display = 'none';

    // Delete functionality
    deleteBtn.onclick = () => {
        deleteHomework(hw.title, hw.dueDate, cell); // Function to delete homework
        displayDiv.removeChild(hwDiv);
        if (displayDiv.children.length === 0) {
          displayDiv.style.display = 'none'; // Hide the display box
      }
        updateCalendar(); // Update the calendar to reflect changes
    };
    let editableSpan = hwDiv.querySelector('.editable');
        editableSpan.onblur = function() {
            // Save the updated details
            updateHomeworkDetails(hw.title, hw.dueDate, this.innerText);
        };

    hwDiv.appendChild(deleteBtn);
    displayDiv.appendChild(hwDiv);
});

  // Positioning the displayDiv near the clicked cell
  displayDiv.style.position = 'absolute';
  displayDiv.style.left = `${cell.getBoundingClientRect().left}px`;
  displayDiv.style.top = `${cell.getBoundingClientRect().bottom + 5}px`;
  displayDiv.style.display = 'block';
}

function updateHomeworkDetails(title, dueDate, newDetails) {
  let homeworks = JSON.parse(localStorage.getItem('homeworks')) || [];
  let hwIndex = homeworks.findIndex(hw => hw.title === title && hw.dueDate === dueDate);
  if (hwIndex !== -1) {
      homeworks[hwIndex].details = newDetails;
      localStorage.setItem('homeworks', JSON.stringify(homeworks));
  }
}

// Delete homework function
function deleteHomework(title, dueDate) {
  let homeworks = JSON.parse(localStorage.getItem('homeworks')) || [];
  homeworks = homeworks.filter(hw => hw.title !== title || hw.dueDate !== dueDate);
  localStorage.setItem('homeworks', JSON.stringify(homeworks));
}



document.getElementById("prev").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateCalendar();
});

document.getElementById("next").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar();
});

// SUMBISSION FORM
document.getElementById("homework-form").addEventListener("submit", function (e) {
    e.preventDefault();

    let dueDateInput = document.getElementById("hw-due-date").value;
    let localDueDate = new Date(dueDateInput); // Add the time to match your local time zone

    let homeworkData = {
        title: document.getElementById("hw-title").value,
        details: document.getElementById("hw-details").value,
        dueDate: localDueDate.toISOString().substring(0, 10), // Convert to ISO date format
    };

    let hwStorage = localStorage.getItem("homeworks");
    let homeworks = hwStorage ? JSON.parse(hwStorage) : [];
    homeworks.push(homeworkData);

    localStorage.setItem("homeworks", JSON.stringify(homeworks));

    // Optionally, clear the form fields here
    document.getElementById("hw-title").value = "";
    document.getElementById("hw-details").value = "";
    document.getElementById("hw-due-date").value = "";

    updateCalendar();
});


updateCalendar(); // Initial call to populate the calendar

document.addEventListener('click', function(event) {
  let displayDiv = document.getElementById('homework-display');
  let calendarBody = document.getElementById('calendar-body');

  // Check if the click is outside the homework display and not on a calendar day
  if (displayDiv && !displayDiv.contains(event.target) && !calendarBody.contains(event.target)) {
      displayDiv.style.display = 'none';
  }
});