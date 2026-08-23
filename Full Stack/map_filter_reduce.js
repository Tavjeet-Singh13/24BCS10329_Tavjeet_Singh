// ===== Question 1: Convert names to uppercase =====
// Convert names to uppercase
// Input: ["alice", "bob", "charlie"]

const names = ["alice", "bob", "charlie"];
const result1 = names.map(name => name.toUpperCase());
console.log(result1);


// ===== Question 2: Get names of people older than 18 =====
// Get names of people older than 18
// const users = [
//   { name: "John", age: 25 },
//   { name: "Jane", age: 17 },
//   { name: "Alex", age: 32 },
//   { name: "Mia", age: 15 }];

const users = [
  { name: "John", age: 25 },
  { name: "Jane", age: 17 },
  { name: "Alex", age: 32 },
  { name: "Mia", age: 15 }];
const result2 = users.filter(user => user.age > 18).map(user => user.name);
console.log(result2);


// ===== Question 3: Calculate total price of products in cart =====
// Calculate total price of products in cart
// const cart = [
//   { name: "Laptop", price: 1200 },
//   { name: "Mouse", price: 25 },
//   { name: "Keyboard", price: 80 }];

const cart = [
  { name: "Laptop", price: 1200 },
  { name: "Mouse", price: 25 },
  { name: "Keyboard", price: 80 }];
const result3 = cart.reduce((sum, item) => sum + item.price, 0);
console.log(result3);


// ===== Question 4: Get full names =====
// Get full names
// const people = [
//   { first: "John", last: "Doe" },
//   { first: "Anna", last: "Smith" }];

const people = [
  { first: "John", last: "Doe" },
  { first: "Anna", last: "Smith" }];
const result4 = people.map(person => person.first + " " + person.last);
console.log(result4);


// ===== Question 5: Get expensive in-stock products names =====
// Get expensive in-stock products names (price > 1000 and inStock)
// const products = [
//   { name: "iPhone 14", price: 1200, inStock: true },
//   { name: "MacBook", price: 1800, inStock: false },
//   { name: "AirPods", price: 250, inStock: true },
//   { name: "iPad Pro", price: 1100, inStock: true }];

const products = [
  { name: "iPhone 14", price: 1200, inStock: true },
  { name: "MacBook", price: 1800, inStock: false },
  { name: "AirPods", price: 250, inStock: true },
  { name: "iPad Pro", price: 1100, inStock: true }];
const result5 = products.filter(p => p.price > 1000 && p.inStock).map(p => p.name);
console.log(result5);


// ===== Question 6: Get names of students who scored above 80 and calculate average =====
// Get names of students who scored above 80 and calculate their average score
// const students = [
//   { name: "Riya", score: 92 },
//   { name: "Aman", score: 78 },
//   { name: "Sneha", score: 88 },
//   { name: "Karan", score: 65 },
//   { name: "Priya", score: 95 }];

const students = [
  { name: "Riya", score: 92 },
  { name: "Aman", score: 78 },
  { name: "Sneha", score: 88 },
  { name: "Karan", score: 65 },
  { name: "Priya", score: 95 }];
const selected6 = students.filter(s => s.score > 80);
const result6 = selected6.map(s => s.name);
const avg6 = selected6.reduce((sum, s) => sum + s.score, 0) / selected6.length;
console.log(result6);
console.log(avg6.toFixed(2));


// ===== Question 7: Calculate total cost after applying 20% discount =====
// Calculate total cost after applying 20% discount on all items that cost more than 1500
// const items = [
//   { name: "Smartphone", price: 32000 },
//   { name: "Charger", price: 1200 },
//   { name: "Headphones", price: 4500 },
//   { name: "Power Bank", price: 1800 }
// ];

const items = [
  { name: "Smartphone", price: 32000 },
  { name: "Charger", price: 1200 },
  { name: "Headphones", price: 4500 },
  { name: "Power Bank", price: 1800 }
];
const result7 = items.reduce((sum, item) => {
  if (item.price > 1500) {
    return sum + (item.price * 0.8);
  }
  return sum + item.price;
}, 0);
console.log(result7);


// ===== Question 8: Get full product names with brand and calculate total stock value =====
// Get full product names with brand and calculate total stock value (price × quantity)
// const products = [
//   { brand: "Samsung", model: "S23", price: 72000, quantity: 5 },
//   { brand: "Apple", model: "iPhone 14", price: 89000, quantity: 2 },
//   { brand: "OnePlus", model: "Nord 3", price: 32000, quantity: 8 }
// ];

const products8 = [
  { brand: "Samsung", model: "S23", price: 72000, quantity: 5 },
  { brand: "Apple", model: "iPhone 14", price: 89000, quantity: 2 },
  { brand: "OnePlus", model: "Nord 3", price: 32000, quantity: 8 }
];
const result8 = products8.map(p => `${p.brand} ${p.model}`);
const value8 = products8.reduce((sum, p) => sum + (p.price * p.quantity), 0);
console.log(result8);
console.log(value8);


// ===== Question 9: Get Engineering employees with salary > 1200000 and total salary =====
// Get names of employees who work in "Engineering" department and have salary > 1200000, then find total salary
// const employees = [
//   { name: "Vikram", department: "Engineering", salary: 1800000 },
//   { name: "Neha", department: "Marketing", salary: 950000 },
//   { name: "Arjun", department: "Engineering", salary: 1350000 },
//   { name: "Pooja", department: "Engineering", salary: 980000 }
// ];

const employees = [
  { name: "Vikram", department: "Engineering", salary: 1800000 },
  { name: "Neha", department: "Marketing", salary: 950000 },
  { name: "Arjun", department: "Engineering", salary: 1350000 },
  { name: "Pooja", department: "Engineering", salary: 980000 }
];
const selected9 = employees.filter(e => e.department === "Engineering" && e.salary > 1200000);
const result9 = selected9.map(e => e.name);
const salary9 = selected9.reduce((sum, e) => sum + e.salary, 0);
console.log(result9);
console.log(salary9);


// ===== Question 10: Get completed high-priority tasks as comma-separated string =====
// Get titles of completed high-priority tasks and create one comma-separated string
// const tasks = [
//   { title: "Database Migration", priority: "high", completed: true },
//   { title: "UI Redesign", priority: "medium", completed: true },
//   { title: "API Testing", priority: "high", completed: false },
//   { title: "Security Audit", priority: "high", completed: true }
// ];

const tasks = [
  { title: "Database Migration", priority: "high", completed: true },
  { title: "UI Redesign", priority: "medium", completed: true },
  { title: "API Testing", priority: "high", completed: false },
  { title: "Security Audit", priority: "high", completed: true }
];
const result10 = tasks.filter(t => t.priority === "high" && t.completed).map(t => t.title).join(", ");
console.log(result10);


// ===== Question 11: Filter in-stock products, apply 15% discount and calculate total =====
// Filter products that are in stock, apply 15% discount, then calculate final cart total
// const cart = [
//   { name: "Monitor", price: 14500, inStock: true },
//   { name: "Keyboard", price: 3200, inStock: false },
//   { name: "Mouse", price: 1800, inStock: true },
//   { name: "Webcam", price: 4200, inStock: true }
// ];

const cart11 = [
  { name: "Monitor", price: 14500, inStock: true },
  { name: "Keyboard", price: 3200, inStock: false },
  { name: "Mouse", price: 1800, inStock: true },
  { name: "Webcam", price: 4200, inStock: true }
];
const result11 = cart11.filter(item => item.inStock).reduce((sum, item) => sum + (item.price * 0.85), 0);
console.log(result11);


// ===== Question 12: Get uppercase active users above 21 and count them =====
// Get names (in uppercase) of users who are active and above 21 years old, then count them
// const users = [
//   { name: "rahul", age: 19, active: true },
//   { name: "simran", age: 24, active: true },
//   { name: "aditya", age: 32, active: false },
//   { name: "kavya", age: 22, active: true }
// ];

const users12 = [
  { name: "rahul", age: 19, active: true },
  { name: "simran", age: 24, active: true },
  { name: "aditya", age: 32, active: false },
  { name: "kavya", age: 22, active: true }
];
const result12 = users12.filter(u => u.active && u.age > 21).map(u => u.name.toUpperCase());
const count12 = result12.length;
console.log(result12);
console.log(count12);


// ===== Question 13: Get winning players and calculate total winning score =====
// Get names of winning players (score > 150) with their score in format "Name (score)", and calculate total winning score
// const players = [
//   { name: "Rohit", score: 168 },
//   { name: "Virat", score: 142 },
//   { name: "Shubman", score: 185 },
//   { name: "Ishan", score: 134 }
// ];

const players = [
  { name: "Rohit", score: 168 },
  { name: "Virat", score: 142 },
  { name: "Shubman", score: 185 },
  { name: "Ishan", score: 134 }
];
const selected13 = players.filter(p => p.score > 150);
const result13 = selected13.map(p => `${p.name} (${p.score})`);
const score13 = selected13.reduce((sum, p) => sum + p.score, 0);
console.log(result13);
console.log(score13);

