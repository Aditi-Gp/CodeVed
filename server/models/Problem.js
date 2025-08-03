// server/models/Problem.js
import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String
});

const problemSchema = new mongoose.Schema({
  name: String,
  statement: String,
  difficulty: String,
  testCases: [testCaseSchema]
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
