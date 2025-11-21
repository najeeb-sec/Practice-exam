# CompTIA Security+ Practice Exam Simulator

[![GitHub Pages](https://img.shields.io/badge/View-Demo-blue)](https://najibullahniazi6285-stack.github.io/Practice-exam/)
![GitHub repo size](https://img.shields.io/github/repo-size/najibullahniazi6285-stack/Practice-exam)
![GitHub stars](https://img.shields.io/github/stars/najibullahniazi6285-stack/Practice-exam?style=social)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview
This project is a web-based practice exam simulator for the **CompTIA Security+ certification**. It mimics the real exam environment by presenting **90 multiple-choice questions randomly selected from a larger pool**, with a **90-minute time limit**.

---

## Live Demo
Access the live application here:  
👉 [CompTIA Security+ Practice Exam](https://najibullahniazi6285-stack.github.io/Practice-exam/)

---

## Features
- **Realistic Exam Format**: 90 questions to be completed in 90 minutes.
- **Large Question Pool**: Questions are randomly selected from a comprehensive `questions.json` file.
- **Timer Functionality**: A countdown timer tracks your progress, with options to pause and resume.
- **Varied Question Types**: Supports both single and multiple-answer questions.
- **Immediate Feedback**: Automatically advances to the next question after an answer is submitted.
- **Detailed Results**: At the end of the exam, view your final score and a list of incorrectly answered questions, complete with correct answers and reference links for further study.

---

## File Structure
- `index.html`: The main HTML file that structures the web page.
- `style.css`: Contains all the styles for the application.
- `script.js`: The core application logic, handling question loading, the timer, scoring, and user interactions.
- `questions.json`: A JSON file containing the pool of exam questions, their possible answers, and references.

---

## Installation & Usage

### **Run Locally with Python HTTP Server**
1. Clone the repository:
   ```bash
   git clone https://github.com/najibullahniazi6285-stack/Practice-exam.git
   cd Practice-exam
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### **Requirements**
- Python 3.x
- Modern web browser (Chrome, Firefox, Edge)

---

## Screenshots

<img width="866" height="248" alt="Screenshot 2025-11-21 at 12 23 52 AM" src="https://github.com/user-attachments/assets/b91a3d1b-aac2-4c74-8425-ea4e5e230b4c" />

---

## Future Enhancements
- Add **Performance-Based Questions (PBQs)**.
- Extend `questions.json` schema for new question types.
- Update UI for interactive PBQs.

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


