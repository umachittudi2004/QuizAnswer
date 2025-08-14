import React, { useState } from "react";
import "./App.css";
import bcrypt from "bcryptjs";

/**
 * Finds the correct option for a question by comparing each option value
 * to the hashed answer using bcrypt's compareSync.
 * Returns the option number (1/2/3/4) or null if not found.
 */
function getCorrectOption(question) {
  const options = ["option1", "option2", "option3", "option4"];
  for (let i = 0; i < options.length; i++) {
    const value = question[options[i]];
    if (
      value !== undefined &&
      bcrypt.compareSync(value, question.answer)
    ) {
      return i + 1;
    }
  }
  return null; // In case no match found
}

/**
 * Parses the questions from the JSON input.
 * Returns an array of {number, correctOption}
 * Throws if questions array is missing.
 */
function parseQuestions(jsonData) {
  if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
    throw new Error("No questions array found in the input.");
  }
  return jsonData.questions.map((question, idx) => {
    const correctOption = getCorrectOption(question);
    return {
      number: idx + 1,
      correctOption,
    };
  });
}

export default function App() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleProcess = () => {
    setError("");
    setResults([]);
    try {
      const jsonData = JSON.parse(input);
      const output = parseQuestions(jsonData);
      // Check for any questions with null correctOption (not found)
      if (output.some((row) => row.correctOption === null)) {
        setError(
          "Could not match the answer hash to any option for one or more questions. Please check your data."
        );
        setResults(output);
      } else {
        setResults(output);
      }
    } catch (err) {
      setError(
        err.message === "No questions array found in the input."
          ? "Your JSON is missing the 'questions' array."
          : "Invalid JSON format. Please check your input."
      );
    }
  };

  // Add this inside App() before the return:
  const handleReset = () => {
    setInput("");
    setResults([]);
    setError("");
  };


  return (
    <div className="container">
      <h1>Quiz Answer Extractor</h1>
      <p>
        Paste your full JSON containing <code>questions</code> and encoded answer keys below. The app will output the correct option number (<strong>1/2/3/4</strong>) for each question.
      </p>
      <textarea
        className="json-input"
        rows={12}
        placeholder="Paste your JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="process-btn" onClick={handleProcess}>
          Get Correct Options
        </button>
        <button
          className="reset-btn"
          onClick={handleReset}
          style={{ background: "#6c757d" }}
        >
          Reset
        </button>
      </div>


      {error && <div className="error-msg">{error}</div>}
      {results.length > 0 && (
        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Question No.</th>
                <th>Correct Option</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.number}>
                  <td>{row.number}</td>
                  <td>
                    {row.correctOption !== null ? row.correctOption : <span style={{ color: "#dc3545" }}>Not Found</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <footer>
        <span>
          &copy; {new Date().getFullYear()} Quiz Extractor | Mobile &amp; Desktop Friendly
        </span>
      </footer>
    </div>
  );
}