let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function updateCalendar() {
  let monthYear = document.getElementById("month-year");
  monthYear.textContent = `${currentMonth + 1}-${currentYear}`;

  let today = new Date(); // Get today's date
  let isCurrentMonth =
    today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  let daysOfMonth = daysInMonth(currentMonth, currentYear);

  let calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = ""; // Clear existing calendar

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      let cell = document.createElement("td");

      if (i === 0 && j < firstDayOfMonth) {
        cell.appendChild(document.createTextNode(""));
      } else if (date > daysOfMonth) {
        break;
      } else {
        cell.appendChild(document.createTextNode(date));

        if (isCurrentMonth && date === today.getDate()) {
          cell.classList.add("current-day"); // Highlight current day
        } else if (
          isCurrentMonth &&
          new Date(currentYear, currentMonth, date) < today
        ) {
          cell.classList.add("past-day"); // Grey out past days
        }

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
  updateUpcomingAssignments();
}

function displayHomework() {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  homeworks.forEach((hw) => {
    // Parse the date in local time zone
    let dateComponents = hw.dueDate.split("-");
    let dueDate = new Date(
      dateComponents[0],
      dateComponents[1] - 1,
      dateComponents[2]
    );

    if (
      dueDate.getMonth() === currentMonth &&
      dueDate.getFullYear() === currentYear
    ) {
      let dayOfMonth = dueDate.getDate();
      let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

      let cellIndex = dayOfMonth + firstDayOfMonth - 1;
      let row = Math.floor(cellIndex / 7) + 1;
      let column = (cellIndex % 7) + 1;

      let targetCell = document.querySelector(
        `#calendar-body tr:nth-child(${row}) td:nth-child(${column})`
      );
      if (
        targetCell &&
        targetCell.textContent.trim() === dayOfMonth.toString()
      ) {
        let hwMarker = document.createElement("div");
        hwMarker.textContent = hw.title;
        hwMarker.className = "homework-marker";
        targetCell.appendChild(hwMarker);
      }
    }
  });
}

function displayHomeworkForDay(cell) {
  let displayDiv = document.getElementById("homework-display");

  // Hide existing display if it exists and clear content
  if (displayDiv) {
    displayDiv.style.display = "none";
    displayDiv.innerHTML = ""; // Clear existing content
  } else {
    // Create displayDiv if it doesn't exist
    displayDiv = document.createElement("div");
    displayDiv.id = "homework-display";
    document.body.appendChild(displayDiv);
  }

  // 'Add Assignment' button - always displayed
  let addBtn = document.createElement("button");
  addBtn.textContent = "Add Assignment";
  addBtn.className = "add-assignment-btn";
  addBtn.onclick = function () {
    let clickedDate = new Date(currentYear, currentMonth, parseInt(cell.textContent));
    addNewHomework(clickedDate); // Function to add new homework
  };
  displayDiv.appendChild(addBtn);

  // Determine if the clicked cell represents a day of the month
  let day = parseInt(cell.textContent);
  if (!day) return;

  let clickedDateStr = formatDate(currentYear, currentMonth, day);
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  let dueHomeworks = homeworks.filter(hw => hw.dueDate === clickedDateStr);

  // Add homework details to the display
  dueHomeworks.forEach(hw => {
    let hwDiv = document.createElement("div");
    hwDiv.classList.add("homework-item");
    hwDiv.innerHTML = `<strong>${hw.title}</strong>: <span class='editable' contenteditable='true'>${hw.details}</span>`;
    
    // saving edits
    let detailsSpan = hwDiv.querySelector('.editable');
    detailsSpan.onblur = () => {
        let newDetails = detailsSpan.textContent;
        updateHomeworkDetails(hw.title, hw.dueDate, newDetails);
    };
    // Create delete button
    let deleteBtn = document.createElement("span");
    deleteBtn.textContent = " X";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.display = "inline"; // Keep delete button always visible

    // Delete functionality
    deleteBtn.onclick = () => {
      deleteHomework(hw.title, hw.dueDate, cell); // Function to delete homework
      displayDiv.removeChild(hwDiv);
      if (displayDiv.children.length === 0) {
        displayDiv.style.display = "none"; // Hide the display box
      }
      updateCalendar(); // Update the calendar to reflect changes
    };

    hwDiv.appendChild(deleteBtn);
    displayDiv.appendChild(hwDiv);
  });

  // Positioning the displayDiv near the clicked cell
  displayDiv.style.position = "absolute";
  displayDiv.style.left = `${cell.getBoundingClientRect().left}px`;
  displayDiv.style.top = `${cell.getBoundingClientRect().bottom + 5}px`;
  displayDiv.style.display = "block";
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}


//
function addNewHomework(date) {
  // Logic to input new homework details
  // This could be a modal or a simple prompt
  let title = prompt("Enter Homework Title:");
  if (!title) return; // Exit if no title is entered

  let details = prompt("Enter Homework Details:");
  if (!details) return; // Exit if no details are entered

  let homeworkData = {
    title: title,
    details: details,
    dueDate: date.toISOString().substring(0, 10), // Format date as YYYY-MM-DD
  };

  // Save to localStorage
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  homeworks.push(homeworkData);
  localStorage.setItem("homeworks", JSON.stringify(homeworks));

  updateCalendar(); // Update the calendar with new homework
  updateUpcomingAssignments(); // Update the upcoming assignments list

}

function updateHomeworkDetails(title, dueDate, newDetails) {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  let hwIndex = homeworks.findIndex(
    (hw) => hw.title === title && hw.dueDate === dueDate
  );
  if (hwIndex !== -1) {
    homeworks[hwIndex].details = newDetails;
    localStorage.setItem("homeworks", JSON.stringify(homeworks));
    updateCalendar();
    updateUpcomingAssignments();
  }
}

// Delete homework function
function deleteHomework(title, dueDate) {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  homeworks = homeworks.filter(
    (hw) => hw.title !== title || hw.dueDate !== dueDate
  );
  localStorage.setItem("homeworks", JSON.stringify(homeworks));
  updateUpcomingAssignments();
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

function updateUpcomingAssignments() {
  let upcomingList = document.getElementById("upcoming-list");
  upcomingList.innerHTML = "";

  let today = new Date();
    // Reset hours, minutes, seconds, and milliseconds to compare only dates
    today.setHours(0, 0, 0, 0)

  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  let upcomingHomeworks = homeworks
    .filter(hw => new Date(hw.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

    upcomingHomeworks.forEach(hw => {
      let listItem = document.createElement("li");
      listItem.className = "upcoming-item";

    // Container for editable content
    let contentContainer = document.createElement("div");

    // Editable title
    let titleDiv = document.createElement("div");
    titleDiv.textContent = hw.title;
    titleDiv.contentEditable = true;
    titleDiv.className = "editable-title";
    titleDiv.onblur = () =>
      updateHomework(titleDiv.textContent, hw.dueDate, hw.details, hw.title);
    contentContainer.appendChild(titleDiv);

    // Editable due date
    let dateDiv = document.createElement("div");
    dateDiv.textContent = `Due: ${hw.dueDate}`;
    dateDiv.contentEditable = true;
    dateDiv.className = "editable-date";
    dateDiv.onblur = () =>
      updateHomework(
        hw.title,
        dateDiv.textContent.replace("Due: ", ""),
        hw.details,
        hw.title
      );
    contentContainer.appendChild(dateDiv);

    // Editable details
    let detailsDiv = document.createElement("div");
    detailsDiv.textContent = hw.details;
    detailsDiv.contentEditable = true;
    detailsDiv.className = "editable-details";
    detailsDiv.onblur = () => {
      let newDetails = detailsDiv.textContent;
      updateHomeworkDetails(hw.title, hw.dueDate, newDetails);
    };

    listItem.appendChild(contentContainer);

    // Delete button
    let deleteBtn = document.createElement("span");
    deleteBtn.textContent = " X";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteHomework(hw.title);
    listItem.appendChild(deleteBtn);

    upcomingList.appendChild(listItem);
  });
}

function deleteHomework(title) {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  homeworks = homeworks.filter((hw) => hw.title !== title);
  localStorage.setItem("homeworks", JSON.stringify(homeworks));
  updateCalendar();
  updateUpcomingAssignments();
}

function updateHomework(newTitle, newDueDate, newDetails, originalTitle) {
  let homeworks = JSON.parse(localStorage.getItem("homeworks")) || [];
  let hwIndex = homeworks.findIndex((hw) => hw.title === originalTitle);
  if (hwIndex !== -1) {
    homeworks[hwIndex].title = newTitle;
    homeworks[hwIndex].dueDate = newDueDate;
    homeworks[hwIndex].details = newDetails;
    localStorage.setItem("homeworks", JSON.stringify(homeworks));
    updateCalendar(); // To reflect changes in the calendar
    updateUpcomingAssignments(); // Refresh the upcoming assignments list
  }
}

// SUMBISSION FORM
document
  .getElementById("homework-form")
  .addEventListener("submit", function (e) {
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
    updateUpcomingAssignments();
  });

updateCalendar(); // Initial call to populate the calendar

document.addEventListener("click", function (event) {
  let displayDiv = document.getElementById("homework-display");
  let calendarBody = document.getElementById("calendar-body");

  // Check if the click is outside the homework display and not on a calendar day
  if (
    displayDiv &&
    !displayDiv.contains(event.target) &&
    !calendarBody.contains(event.target)
  ) {
    displayDiv.style.display = "none";
  }
});
