│                                                                                                                 │
│     1 # CompTIA Security+ Practice Exam Simulator                                                               │
│     2                                                                                                           │
│     3 ## Overview                                                                                               │
│     4 This project is a web-based practice exam simulator for the CompTIA Security+ certification. It's         │
│       designed to mimic the real exam environment by presenting 90 multiple-choice questions randomly selected  │
│       from a larger pool, with a 90-minute time limit.                                                          │
│     5                                                                                                           │
│     6 ## Features                                                                                               │
│     7 - **Realistic Exam Format**: 90 questions to be completed in 90 minutes.                                  │
│     8 - **Large Question Pool**: Questions are randomly selected from a comprehensive `questions.json` file.    │
│     9 - **Timer Functionality**: A countdown timer tracks your progress, with options to pause and resume.      │
│    10 - **Varied Question Types**: Supports both single and multiple-answer questions.                          │
│    11 - **Immediate Feedback**: Automatically advances to the next question after an answer is submitted.       │
│    12 - **Detailed Results**: At the end of the exam, view your final score and a list of incorrectly answered  │
│       questions, complete with the correct answers and reference links for further study.

 ## File Structure                                                                                         │
│    32 - `index.html`: The main HTML file that structures the web page.                                          │
│    33 - `style.css`: Contains all the styles for the application.                                               │
│    34 - `script.js`: The core application logic, handling question loading, the timer, scoring, and user        │
│       interactions.                                                                                             │
│    35 - `questions.json`: A JSON file containing the pool of exam questions, their possible answers, and        │
│       references.                                                                                               │
│    36                                                                                                           │
│    37 ## Future Enhancements                                                                                    │
│    38 The next major feature in development is the inclusion of Performance-Based Questions (PBQs). This will   │
│       involve:                                                                                                  │
│    39 - Extending the `questions.json` schema to support new PBQ types (e.g., fill-in-the-blank,                │
│       drag-and-drop).                                                                                           │
│    40 - Adding logic to `script.js` to render and evaluate the new interactive questions.                       │
│    41 - Updating `index.html` and `style.css` to accommodate the new PBQ elements.
