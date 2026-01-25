// server/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const problems = [
  {
    name: "Sum of Two Numbers",
    statement: "Read two integers and print their sum.",
    difficulty: "Easy",
    testCases: [
      { input: "2 3", output: "5" },
      { input: "100 50", output: "150" }
    ]
  },
  {
    name: "Factorial",
    statement: "Print the factorial of a number N.",
    difficulty: "Easy",
    testCases: [
      { input: "5", output: "120" },
      { input: "1", output: "1" }
    ]
  },
  {
    name: "Palindrome Checker",
    statement: "Check if the given string is a palindrome.",
    difficulty: "Medium",
    testCases: [
      { input: "madam", output: "YES" },
      { input: "hello", output: "NO" }
    ]
  },
  {
    name: "GCD of Two Numbers",
    statement: "Compute the GCD of two numbers.",
    difficulty: "Medium",
    testCases: [
      { input: "12 18", output: "6" },
      { input: "100 25", output: "25" }
    ]
  },
  {
    name: "Count Digits",
    statement: "Count the number of digits in a given number.",
    difficulty: "Easy",
    testCases: [
      { input: "12345", output: "5" },
      { input: "0", output: "1" }
    ]
  }
];

mongoose.connect(process.env.MONGO_URI 
, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");

  await Problem.deleteMany(); // optional: clean old data
  await Problem.insertMany(problems);

  console.log("Inserted problems successfully");
  process.exit();
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
