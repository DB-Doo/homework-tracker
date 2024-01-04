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

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      let cell = document.createElement("td");
      if (i === 0 && j < firstDay) {
        let cellText = document.createTextNode("");
        cell.appendChild(cellText);
      } else if (date > daysOfMonth) {
        break;
      } else {
        let cellText = document.createTextNode(date);
        if (
          date === new Date().getDate() &&
          currentYear === new Date().getFullYear() &&
          currentMonth === new Date().getMonth()
        ) {
          cell.classList.add("today");
        }
        cell.appendChild(cellText);
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
    // Correctly parse the date
    const [year, month, day] = hw.dueDate.split('-').map(num => parseInt(num, 10));
    let dueDate = new Date(year, month - 1, day, 23, 59); // Set time to 23:59

    if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear) {
      // Correctly find the cell for the due date
      let calendarStartDate = new Date(currentYear, currentMonth, 1);
      let startDayOfWeek = calendarStartDate.getDay();
      let cellIndex = day + startDayOfWeek - 1; // Calculate the correct cell index

      let cellRow = Math.ceil(cellIndex / 7);
      let cellColumn = cellIndex % 7 + 1; // +1 because nth-child is 1-based

      let cell = document.querySelector(
        `#calendar-body tr:nth-child(${cellRow}) td:nth-child(${cellColumn})`
      );
      if (cell) {
        let hwMarker = document.createElement("div");
        hwMarker.textContent = hw.title;
        hwMarker.className = "homework-marker";
        cell.appendChild(hwMarker);
      }
    }
  });
}



function displayHomeworkForDay(cell) {
  let day = parseInt(cell.textContent);
  if (!day) return; // Exit if the cell doesn't represent a day of the month

  let clickedDate = new Date(currentYear, currentMonth, day);
  let dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;

  let homeworks = JSON.parse(localStorage.getItem('homeworks')) || [];
  let dueHomeworks = homeworks.filter(hw => hw.dueDate === dateStr);
  

  if (dueHomeworks.length === 0) {
      return; // No homework for this day, so don't show the box
  }

  // Check for an existing displayDiv, create if not exists
  let displayDiv = document.getElementById('homework-display');
  if (!displayDiv) {
      displayDiv = document.createElement('div');
      displayDiv.id = 'homework-display';
      document.body.appendChild(displayDiv); // Append only if it's newly created
  }

  displayDiv.innerHTML = ''; // Clear existing content

  // Add homework details to the display
  dueHomeworks.forEach(hw => {
    let hwDiv = document.createElement('div');
    hwDiv.classList.add('homework-item');
    hwDiv.innerHTML = `<strong>${hw.title}</strong>: ${hw.details}`;

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
          // Or, if you prefer to remove it entirely:
          // displayDiv.parentNode.removeChild(displayDiv);
      }
        updateCalendar(); // Update the calendar to reflect changes
    };

    hwDiv.appendChild(deleteBtn);
    displayDiv.appendChild(hwDiv);
});

  // Positioning the displayDiv near the clicked cell
  displayDiv.style.position = 'absolute';
  displayDiv.style.left = `${cell.getBoundingClientRect().left}px`;
  displayDiv.style.top = `${cell.getBoundingClientRect().bottom + 5}px`;
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
