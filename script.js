document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    const nextButton = document.getElementById('next-btn');
    const pauseButton = document.getElementById('pause-btn');
    const questionContainerElement = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const scoreContainerElement = document.getElementById('score-container');
    const correctScoreElement = document.getElementById('correct-score');
    const wrongScoreElement = document.getElementById('wrong-score');
    const timerElement = document.getElementById('timer');
    const incorrectAnswersContainer = document.getElementById('incorrect-answers-container');
    const examDetailsElement = document.getElementById('exam-details');
    const progressBar = document.getElementById('progress-bar');

    let allQuestions = [];
    let shuffledQuestions, currentQuestionIndex;
    let correctScore, wrongScore;
    let timer;
    let timeRemaining = 5400; // 90 minutes in seconds
    let isPaused = false;
    let selectedAnswers = [];

    fetch('questions.json')
        .then(res => res.json())
        .then(data => {
            allQuestions = data.map(q => {
                const referenceText = q.reference ? ((q.reference.objective || '') + ' ' + (q.reference.link || '')).trim() : 'N/A';
                
                if (q.type === 'fill-in-the-blank') {
                    return {
                        type: 'fill-in-the-blank',
                        question: q.question,
                        answer: q.answer,
                        details: referenceText
                    };
                }

                const answers = Object.keys(q.options).map(key => ({
                    text: key + '. ' + q.options[key],
                    correct: key === q.answer
                }));

                return {
                    type: 'multiple-choice',
                    question: q.question,
                    answers: answers,
                    details: referenceText
                };
            }).filter(q => (q.type === 'multiple-choice' && q.answers.some(a => a.correct)) || q.type === 'fill-in-the-blank');
            
            startButton.addEventListener('click', startGame);
            nextButton.addEventListener('click', handleNextButton);
            pauseButton.addEventListener('click', togglePause);
        })
        .catch(error => console.error('Error loading questions:', error));

    function startGame() {
        shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 90);
        startButton.classList.add('hide');
        examDetailsElement.classList.remove('hide');
        questionContainerElement.classList.remove('hide');
        scoreContainerElement.classList.remove('hide');
        incorrectAnswersContainer.classList.add('hide');
        pauseButton.classList.remove('hide');

        currentQuestionIndex = 0;
        correctScore = 0;
        wrongScore = 0;
        timeRemaining = 5400;
        isPaused = false;
        pauseButton.textContent = 'Pause';
        updateScore();
        
        startTimer();
        setNextQuestion();
    }

    function startTimer() {
        timer = setInterval(() => {
            if (!isPaused) {
                timeRemaining--;
                updateTimerDisplay();
                if (timeRemaining <= 0) {
                    endGame();
                }
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            pauseButton.textContent = 'Resume';
            clearInterval(timer);
        } else {
            pauseButton.textContent = 'Pause';
            startTimer();
        }
    }

    function setNextQuestion() {
        resetState();
        if (currentQuestionIndex < shuffledQuestions.length) {
            showQuestion(shuffledQuestions[currentQuestionIndex]);
        } else {
            endGame();
        }
    }

    function showQuestion(question) {
        questionElement.textContent = `Question ${currentQuestionIndex + 1}: ${question.question}`;
        updateProgressBar();
        
        if (question.type === 'fill-in-the-blank') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'fill-in-the-blank-input';
            input.classList.add('fill-in-the-blank-input');
            answerButtonsElement.appendChild(input);

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.classList.add('btn', 'submit-btn');
            submitButton.addEventListener('click', () => {
                const userAnswer = input.value.trim();
                checkAnswer(userAnswer);
                setTimeout(setNextQuestion, 1000);
            });
            answerButtonsElement.appendChild(submitButton);
        } else {
            const requiredAnswers = question.answers.filter(a => a.correct).length;
            nextButton.dataset.required = requiredAnswers;

            question.answers.forEach(answer => {
                const button = document.createElement('button');
                button.textContent = answer.text;
                button.classList.add('btn', 'answer-btn');
                button.dataset.correct = answer.correct;
                button.addEventListener('click', selectAnswer);
                answerButtonsElement.appendChild(button);
            });
        }
    }

    function resetState() {
        clearStatusClass(document.body);
        nextButton.classList.add('hide');
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
        selectedAnswers = [];
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        selectedAnswers = [selectedButton];
        checkAnswer();
        setTimeout(setNextQuestion, 1000); 
    }
    
    function handleNextButton() {
        checkAnswer();
        setTimeout(setNextQuestion, 1000);
    }

    function checkAnswer(userAnswer) {
        const question = shuffledQuestions[currentQuestionIndex];
        let isCorrect = false;

        if (question.type === 'fill-in-the-blank') {
            isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();
            const input = document.getElementById('fill-in-the-blank-input');
            setStatusClass(input, isCorrect);
            input.disabled = true;
            answerButtonsElement.querySelector('.submit-btn').disabled = true;
        } else {
            const correctAnswers = question.answers.filter(a => a.correct);
            isCorrect = selectedAnswers.length === correctAnswers.length &&
                        selectedAnswers.every(btn => btn.dataset.correct === 'true');
            
            Array.from(answerButtonsElement.children).forEach(button => {
                setStatusClass(button, button.dataset.correct === 'true');
                button.disabled = true;
            });
        }

        if (isCorrect) {
            correctScore++;
        } else {
            wrongScore++;
            incorrectAnswersContainer.appendChild(createIncorrectAnswerElement(question, currentQuestionIndex));
        }
        
        updateScore();
        currentQuestionIndex++;
    }

    function setStatusClass(element, isCorrect) {
        clearStatusClass(element);
        if (isCorrect) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct', 'wrong', 'selected');
    }

    function updateScore() {
        correctScoreElement.textContent = correctScore;
        wrongScoreElement.textContent = wrongScore;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    function createIncorrectAnswerElement(question, index) {
        const originalQuestion = allQuestions.find(q => q.question === question.question);
        const element = document.createElement('div');
        element.classList.add('incorrect-answer');
        let correctAnswersText;
        let optionsDetails = '';

        if (question.type === 'fill-in-the-blank') {
            correctAnswersText = question.answer;
        } else {
            correctAnswersText = question.answers.filter(a => a.correct).map(a => a.text).join(', ');
            if (originalQuestion && originalQuestion.explanation) {
                optionsDetails = '<ul>';
                for (const key in originalQuestion.options) {
                    const isCorrect = key === originalQuestion.answer;
                    const explanationText = isCorrect 
                        ? (originalQuestion.explanation.correct || '')
                        : (originalQuestion.explanation.incorrect[key] || '');
                    optionsDetails += `<li><strong>${key}:</strong> ${originalQuestion.options[key]}<br><em>${explanationText}</em></li>`;
                }
                optionsDetails += '</ul>';
            }
        }

        const referenceLink = originalQuestion.reference && originalQuestion.reference.link 
            ? `<a href="${originalQuestion.reference.link}" target="_blank">${originalQuestion.reference.objective}</a>`
            : (question.details || 'N/A');

        element.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
            <p><strong>Correct Answer:</strong> ${correctAnswersText}</p>
            <div><strong>Explanations:</strong>${optionsDetails}</div>
            <p><strong>Reference:</strong> ${referenceLink}</p>
        `;
        return element;
    }

    function endGame() {
        clearInterval(timer);
        questionContainerElement.classList.add('hide');
        nextButton.classList.add('hide');
        pauseButton.classList.add('hide');
        
        if (wrongScore > 0) {
            const header = document.createElement('h3');
            header.textContent = 'Review Incorrect Answers';
            incorrectAnswersContainer.prepend(header);
            incorrectAnswersContainer.classList.remove('hide');
        }

        const passMark = Math.ceil(shuffledQuestions.length * 0.75);
        const message = correctScore >= passMark 
            ? `Congratulations! You passed with ${correctScore}/${shuffledQuestions.length}.`
            : `You did not pass. You scored ${correctScore}/${shuffledQuestions.length}. You need ${passMark} to pass.`;
        
        alert(message);
        startButton.textContent = 'Restart Exam';
        startButton.classList.remove('hide');
    }
});