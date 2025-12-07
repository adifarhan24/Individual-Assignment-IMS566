// js/data.js

// Get students from localStorage or create initial demo list
function getStudents() {
  const stored = localStorage.getItem("edu_students");
  if (stored) return JSON.parse(stored); // read once and reuse [web:92]

  const initial = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", course: "Mathematics 101", status: "Active" },
    { id: 2, name: "Brian Lee", email: "brian@example.com", course: "Science Fundamentals", status: "Active" },
    { id: 3, name: "Carla Mendes", email: "carla@example.com", course: "English Literature", status: "Inactive" },
    { id: 4, name: "David Wong", email: "david@example.com", course: "Computer Basics", status: "Active" },
    { id: 5, name: "Emma Davis", email: "emma@example.com", course: "Art & Design", status: "Inactive" },
  ]; 
  ; 

  localStorage.setItem("edu_students", JSON.stringify(initial));
  return initial;
}

// Save students back to localStorage
function saveStudents(students) {
  localStorage.setItem("edu_students", JSON.stringify(students)); 
}
