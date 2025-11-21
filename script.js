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
    const resultsSummaryContainer = document.getElementById('results-summary-container');
    const selectionContainer = document.getElementById('selection-container');
    const questionsAButton = document.getElementById('questionsA-btn');
    const questionsBButton = document.getElementById('questionsB-btn');
    const questionsCButton = document.getElementById('questionsC-btn');

    nextButton.addEventListener('click', handleNextButton);

    let allQuestions = [];
    let shuffledQuestions, currentQuestionIndex;
    let correctScore, wrongScore;
    let timer;
    let timeRemaining = 5400; // 90 minutes in seconds
    let isPaused = false;
    let selectedAnswers = [];
    const explanationContainer = document.getElementById('explanation-container');

    questionsAButton.addEventListener('click', () => selectQuestionSet('questions.json', questionsAButton));
    questionsBButton.addEventListener('click', () => selectQuestionSet('questions2.json', questionsBButton));
    questionsCButton.addEventListener('click', () => selectQuestionSet('question3.json', questionsCButton));

    function selectQuestionSet(fileName, selectedButton) {
        fetch(fileName)
            .then(res => res.json())
            .then(data => {
                allQuestions = data;
                const quizQuestions = data.map(q => {
                    if (q.type === 'fill-in-the-blank') {
                        return {
                            type: 'fill-in-the-blank',
                            question: q.question,
                            answer: q.answer,
                            originalId: q.id
                        };
                    } else if (q.type === 'drag-and-drop') {
                        return {
                            type: 'drag-and-drop',
                            question: q.question,
                            dragOptions: q.dragOptions,
                            dropTargets: q.dropTargets,
                            correctMapping: q.correctMapping,
                            originalId: q.id
                        };
                    }
                    const answers = Object.keys(q.options).map(key => ({
                        text: key + '. ' + q.options[key],
                        correct: Array.isArray(q.answer) ? q.answer.includes(key) : key === q.answer
                    }));
                    return {
                        type: 'multiple-choice',
                        question: q.question,
                        answers: answers,
                        originalId: q.id
                    };
                }).filter(q => (q.type === 'multiple-choice' && q.answers.some(a => a.correct)) || q.type === 'fill-in-the-blank' || q.type === 'drag-and-drop');
                
                document.querySelectorAll('.selection-btn').forEach(btn => btn.classList.remove('selected'));
                selectedButton.classList.add('selected');
                startButton.classList.remove('hide');
                startButton.onclick = () => startGame(quizQuestions);
            })
            .catch(error => console.error('Error loading questions:', error));
    }

    function startGame(quizQuestions) {
        selectionContainer.classList.add('hide');
        shuffledQuestions = quizQuestions.sort(() => Math.random() - 0.5).slice(0, 90);
        startButton.classList.add('hide');
        examDetailsElement.classList.remove('hide');
        questionContainerElement.classList.remove('hide');
        scoreContainerElement.classList.remove('hide');
        incorrectAnswersContainer.innerHTML = ''; // Clear previous results
        incorrectAnswersContainer.classList.add('hide');
        resultsSummaryContainer.classList.add('hide');
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
                });
                answerButtonsElement.appendChild(submitButton);
            } else if (question.type === 'drag-and-drop') {
                const dragDropContainer = document.createElement('div');
                dragDropContainer.classList.add('drag-drop-container');
    
                const dragOptionsContainer = document.createElement('div');
                dragOptionsContainer.classList.add('drag-options-container');
                question.dragOptions.forEach(option => {
                    const draggable = document.createElement('div');
                    draggable.classList.add('draggable');
                    draggable.textContent = option.text;
                    draggable.setAttribute('draggable', 'true');
                    draggable.dataset.id = option.id;
                    draggable.addEventListener('dragstart', dragStart);
                    dragOptionsContainer.appendChild(draggable);
                });
                dragDropContainer.appendChild(dragOptionsContainer);
    
                const dropTargetsContainer = document.createElement('div');
                dropTargetsContainer.classList.add('drop-targets-container');
                question.dropTargets.forEach(target => {
                    const dropZone = document.createElement('div');
                    dropZone.classList.add('drop-zone');
                    dropZone.textContent = target.text;
                    dropZone.dataset.id = target.id;
                    dropZone.addEventListener('dragover', dragOver);
                    dropZone.addEventListener('drop', drop);
                    dropTargetsContainer.appendChild(dropZone);
                });
                dragDropContainer.appendChild(dropTargetsContainer);
                answerButtonsElement.appendChild(dragDropContainer);
    
                const submitButton = document.createElement('button');
                submitButton.textContent = 'Submit';
                submitButton.classList.add('btn', 'submit-btn');
                submitButton.addEventListener('click', () => {
                    checkAnswer();
                });
                answerButtonsElement.appendChild(submitButton);
    
            } else {
                const isMultipleAnswer = Array.isArray(allQuestions.find(q => q.id === question.originalId).answer);

                question.answers.forEach(answer => {
                    const button = document.createElement('button');
                    button.textContent = answer.text;
                    button.classList.add('btn', 'answer-btn');
                    button.dataset.correct = answer.correct;
                    if (isMultipleAnswer) {
                        button.addEventListener('click', toggleSelection);
                    } else {
                        button.addEventListener('click', selectAnswer);
                    }
                    answerButtonsElement.appendChild(button);
                });

                if (isMultipleAnswer) {
                    const submitButton = document.createElement('button');
                    submitButton.textContent = 'Submit';
                    submitButton.classList.add('btn', 'submit-btn');
                    submitButton.addEventListener('click', () => {
                        checkAnswer();
                    });
                    answerButtonsElement.appendChild(submitButton);
                }
            }
        }
    
        function dragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
        }
    
        function dragOver(e) {
            e.preventDefault(); // Allow drop
        }
    
        function drop(e) {
            e.preventDefault();
            const draggableId = e.dataTransfer.getData('text/plain');
            const draggableElement = document.querySelector(`[data-id="${draggableId}"]`);
            const dropZoneElement = e.target.closest('.drop-zone');
    
            if (dropZoneElement && draggableElement) {
                // Remove from previous drop zone if it was already dropped
                const previousDropZone = draggableElement.closest('.drop-zone');
                if (previousDropZone) {
                    previousDropZone.removeChild(draggableElement);
                } else {
                    // If it was in the drag options container, remove it from there
                    const dragOptionsContainer = draggableElement.closest('.drag-options-container');
                    if (dragOptionsContainer) {
                        dragOptionsContainer.removeChild(draggableElement);
                    }
                }
                dropZoneElement.appendChild(draggableElement);
                // Store the mapping
                selectedAnswers.push({
                    dragId: draggableId,
                    dropId: dropZoneElement.dataset.id
                });
            }
        }
    
        function resetState() {
            clearStatusClass(document.body);
            nextButton.classList.add('hide');
            while (answerButtonsElement.firstChild) {
                answerButtonsElement.removeChild(answerButtonsElement.firstChild);
            }
            explanationContainer.classList.add('hide'); // Hide explanation for new question
            explanationContainer.innerHTML = ''; // Clear previous explanation
            selectedAnswers = [];
        }
    
        function toggleSelection(e) {
            const selectedButton = e.target;
            selectedButton.classList.toggle('selected');
            selectedAnswers = Array.from(answerButtonsElement.querySelectorAll('.answer-btn.selected'));
        }

        function selectAnswer(e) {
            const selectedButton = e.target;
            selectedAnswers = [selectedButton];
            checkAnswer();
        }
        
        function handleNextButton() {
            currentQuestionIndex++;
            setNextQuestion();
        }
    
        function checkAnswer(userAnswer) {
            const question = shuffledQuestions[currentQuestionIndex];
            const originalQuestion = allQuestions.find(q => q.id === question.originalId);
            let isCorrect = false;
            const isMultipleAnswer = Array.isArray(originalQuestion.answer);

            if (question.type === 'fill-in-the-blank') {
                isCorrect = userAnswer.toLowerCase() === originalQuestion.answer.toLowerCase();
                const input = document.getElementById('fill-in-the-blank-input');
                setStatusClass(input, isCorrect);
                input.disabled = true;
                answerButtonsElement.querySelector('.submit-btn').disabled = true;
            } else if (question.type === 'drag-and-drop') {
                const correctMapping = originalQuestion.correctMapping;
                let allCorrectlyMapped = true;
                let userMappings = {};
                
                // Collect user's current mappings from the DOM
                document.querySelectorAll('.drop-zone').forEach(dropZone => {
                    const droppedItem = dropZone.querySelector('.draggable');
                    if (droppedItem) {
                        userMappings[droppedItem.dataset.id] = dropZone.dataset.id;
                    }
                });

                // Check correctness and apply styling
                document.querySelectorAll('.draggable').forEach(draggable => {
                    const dragId = draggable.dataset.id;
                    const userDropId = userMappings[dragId];
                    const correctDropId = correctMapping[dragId];

                    if (userDropId === correctDropId) {
                        setStatusClass(draggable, true); // Correctly placed
                    } else {
                        setStatusClass(draggable, false); // Incorrectly placed
                        allCorrectlyMapped = false;
                    }
                    draggable.setAttribute('draggable', 'false'); // Disable dragging after submission
                });

                isCorrect = allCorrectlyMapped && Object.keys(userMappings).length === Object.keys(correctMapping).length;
                answerButtonsElement.querySelector('.submit-btn').disabled = true;

            } else if (isMultipleAnswer) {
                const correctKeys = originalQuestion.answer;
                const selectedKeys = selectedAnswers.map(btn => btn.textContent.charAt(0));

                const allCorrectSelected = correctKeys.every(key => selectedKeys.includes(key));
                const noIncorrectSelected = selectedKeys.every(key => correctKeys.includes(key));
                isCorrect = allCorrectSelected && noIncorrectSelected;

                Array.from(answerButtonsElement.children).forEach(button => {
                    const buttonKey = button.textContent.charAt(0);
                    const isButtonCorrect = correctKeys.includes(buttonKey);
                    const isButtonSelected = selectedKeys.includes(buttonKey);

                    if (isButtonSelected && isButtonCorrect) {
                        setStatusClass(button, true); // Correctly selected (green)
                    } else if (isButtonSelected && !isButtonCorrect) {
                        setStatusClass(button, false); // Incorrectly selected (red)
                    } else if (!isButtonSelected && isButtonCorrect) {
                        button.classList.add('correct-unselected'); // Correct but not selected (yellow)
                    }
                    button.disabled = true;
                });
                const submitButton = answerButtonsElement.querySelector('.submit-btn');
                if (submitButton) submitButton.disabled = true;

            } else { // Single answer multiple choice
                isCorrect = selectedAnswers.length > 0 && selectedAnswers.every(btn => btn.dataset.correct === 'true');
                
                if (isCorrect) {
                    selectedAnswers.forEach(btn => setStatusClass(btn, true));
                } else {
                    selectedAnswers.forEach(btn => setStatusClass(btn, false));
                    Array.from(answerButtonsElement.children).forEach(button => {
                        if (button.dataset.correct === 'true') {
                            button.classList.add('correct-unselected');
                        }
                    });
                }
                
                Array.from(answerButtonsElement.children).forEach(button => {
                    button.disabled = true;
                });
            }
    
            if (isCorrect) {
                correctScore++;
            } else {
                wrongScore++;
                let userAnswerText;
                if (question.type === 'fill-in-the-blank') {
                    userAnswerText = userAnswer;
                } else if (question.type === 'drag-and-drop') {
                    userAnswerText = JSON.stringify(userMappings); // Store user's mappings
                } else {
                    userAnswerText = selectedAnswers.map(btn => btn.textContent).join(', ');
                }
                incorrectAnswersContainer.appendChild(createIncorrectAnswerElement(question, currentQuestionIndex, userAnswerText));
            }
            
            updateScore();
            displayExplanation(originalQuestion); // Display explanation after checking answer
            nextButton.classList.remove('hide'); // Show next button to advance
        }
    
        function displayExplanation(originalQuestion) {
            if (!originalQuestion || !originalQuestion.explanation) {
                explanationContainer.innerHTML = '';
                explanationContainer.classList.add('hide');
                return;
            }
        
            let explanationHTML = '';
        
            // Handle multiple choice and fill-in-the-blank
            if (originalQuestion.options) {
                const correctAnswerKeys = Array.isArray(originalQuestion.answer) ? originalQuestion.answer : [originalQuestion.answer];
                
                let correctAnswerHTML = '<h4>Correct Answer</h4>';
                correctAnswerKeys.forEach(key => {
                    if (originalQuestion.options[key]) {
                        correctAnswerHTML += `<p><strong>${key}. ${originalQuestion.options[key]}</strong></p>`;
                    }
                });
                correctAnswerHTML += `<p><em>${originalQuestion.explanation.correct || ''}</em></p>`;
        
                let incorrectAnswersHTML = '<h4>Incorrect Answers</h4><ul>';
                for (const key in originalQuestion.options) {
                    if (!correctAnswerKeys.includes(key)) {
                        const incorrectExplanation = (originalQuestion.explanation.incorrect && originalQuestion.explanation.incorrect[key]) ? originalQuestion.explanation.incorrect[key] : '';
                        incorrectAnswersHTML += `<li><strong>${key}. ${originalQuestion.options[key]}</strong><br><em>${incorrectExplanation}</em></li>`;
                    }
                }
                incorrectAnswersHTML += '</ul>';
        
                explanationHTML += correctAnswerHTML + incorrectAnswersHTML;
            
            // Handle drag-and-drop
            } else if (originalQuestion.type === 'drag-and-drop') {
                let correctMappingHTML = '<h4>Correct Mapping:</h4><ul>';
                for (const dragId in originalQuestion.correctMapping) {
                    const dropId = originalQuestion.correctMapping[dragId];
                    const dragText = originalQuestion.dragOptions.find(opt => opt.id === dragId).text;
                    const dropText = originalQuestion.dropTargets.find(target => target.id === dropId).text;
                    correctMappingHTML += `<li>${dragText} -> ${dropText}</li>`;
                }
                correctMappingHTML += '</ul>';
                
                explanationHTML += correctMappingHTML;
                
                // Also show general correct explanation if available
                if (originalQuestion.explanation.correct) {
                     explanationHTML += `<p><em>${originalQuestion.explanation.correct}</em></p>`;
                }
            } else {
                // Fallback for other types or if no options
                explanationHTML = `<p><em>${originalQuestion.explanation.correct || ''}</em></p>`;
            }
        
        
            const referenceLink = (originalQuestion.reference && originalQuestion.reference.link)
                ? `<a href="${originalQuestion.reference.link}" target="_blank">${originalQuestion.reference.objective || originalQuestion.reference.link}</a>`
                : 'N/A';
        
            explanationContainer.innerHTML = `
                ${explanationHTML}
                <p><strong>Reference:</strong> ${referenceLink}</p>
            `;
            explanationContainer.classList.remove('hide');
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
            element.classList.remove('correct', 'wrong', 'selected', 'correct-unselected');
        }
    
        function updateScore() {
            correctScoreElement.textContent = correctScore;
            wrongScoreElement.textContent = wrongScore;
        }
    
        function updateProgressBar() {
            const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        function createIncorrectAnswerElement(question, index, userAnswerText) {
            const originalQuestion = allQuestions.find(q => q.id === question.originalId);
            const element = document.createElement('div');
            element.classList.add('incorrect-answer');
            let correctAnswerHTML = '';
            let optionsDetails = '';
            const isMultipleAnswer = Array.isArray(originalQuestion.answer);
    
            if (question.type === 'fill-in-the-blank') {
                correctAnswerHTML = `<p><strong>Correct Answer:</strong> ${originalQuestion.answer}</p>`;
            } else if (question.type === 'drag-and-drop') {
                const userMappings = JSON.parse(userAnswerText);
                const correctMapping = originalQuestion.correctMapping;
                
                let userMappingHTML = '<p><strong>Your Mapping:</strong></p><ul>';
                for (const dragId in userMappings) {
                    const dropId = userMappings[dragId];
                    const dragText = originalQuestion.dragOptions.find(opt => opt.id === dragId).text;
                    const dropText = originalQuestion.dropTargets.find(target => target.id === dropId).text;
                    userMappingHTML += `<li>${dragText} -> ${dropText}</li>`;
                }
                userMappingHTML += '</ul>';

                let correctMappingHTML = '<p><strong>Correct Mapping:</strong></p><ul>';
                for (const dragId in correctMapping) {
                    const dropId = correctMapping[dragId];
                    const dragText = originalQuestion.dragOptions.find(opt => opt.id === dragId).text;
                    const dropText = originalQuestion.dropTargets.find(target => target.id === dropId).text;
                    correctMappingHTML += `<li>${dragText} -> ${dropText}</li>`;
                }
                correctMappingHTML += '</ul>';

                correctAnswerHTML = userMappingHTML + correctMappingHTML;

            } else if (isMultipleAnswer) {
                const correctKeys = originalQuestion.answer;
                const correctValues = correctKeys.map(key => `${key}. ${originalQuestion.options[key]}`);
                correctAnswerHTML = `<p><strong>Correct Answers:</strong> ${correctValues.join(', ')}</p>`;

                if (originalQuestion && originalQuestion.explanation && originalQuestion.options) {
                    optionsDetails = '<ul>';
                    const userSelectedKeys = userAnswerText.split(', ').map(text => text.charAt(0));

                    for (const key in originalQuestion.options) {
                        const isUserAnswer = userSelectedKeys.includes(key);
                        const liClass = isUserAnswer ? 'class="selected-answer"' : '';

                        const isCorrectOption = correctKeys.includes(key);
                        const explanationText = isCorrectOption 
                            ? (originalQuestion.explanation.correct && originalQuestion.explanation.correct[key] ? originalQuestion.explanation.correct[key] : '')
                            : (originalQuestion.explanation.incorrect && originalQuestion.explanation.incorrect[key] ? originalQuestion.explanation.incorrect[key] : '');
                        optionsDetails += `<li ${liClass}><strong>${key}:</strong> ${originalQuestion.options[key]}<br><em>${explanationText}</em></li>`;
                    }
                    optionsDetails += '</ul>';
                }

            } else { // Single answer multiple choice
                const correctKey = originalQuestion.answer;
                const correctValue = originalQuestion.options[correctKey];
                correctAnswerHTML = `<p><strong>Correct Answer:</strong> ${correctKey}. ${correctValue}</p>`;

                if (originalQuestion && originalQuestion.explanation && originalQuestion.options) {
                    optionsDetails = '<ul>';
                    for (const key in originalQuestion.options) {
                        const optionText = `${key}. ${originalQuestion.options[key]}`;
                        const isUserAnswer = optionText === userAnswerText;
                        const liClass = isUserAnswer ? 'class="selected-answer"' : '';

                        const isCorrect = key === originalQuestion.answer;
                        const explanationText = isCorrect 
                            ? (originalQuestion.explanation.correct || '')
                            : (originalQuestion.explanation.incorrect && originalQuestion.explanation.incorrect[key] ? originalQuestion.explanation.incorrect[key] : '');
                        optionsDetails += `<li ${liClass}><strong>${key}:</strong> ${originalQuestion.options[key]}<br><em>${explanationText}</em></li>`;
                    }
                    optionsDetails += '</ul>';
                }
            }
    
            const referenceLink = (originalQuestion && originalQuestion.reference && originalQuestion.reference.link)
                ? `<a href="${originalQuestion.reference.link}" target="_blank">${originalQuestion.reference.objective || originalQuestion.reference.link}</a>`
                : 'N/A';
    
            element.innerHTML = `
                <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                <p><strong>Your Answer:</strong> ${userAnswerText}</p>
                ${correctAnswerHTML}
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
        const passed = correctScore >= passMark;
        const message = passed
            ? `Congratulations! You passed.`
            : `You did not pass. You need ${passMark} correct answers to pass.`;
        
        resultsSummaryContainer.innerHTML = `
            <h2>Exam Results</h2>
            <p class="${passed ? 'pass' : 'fail'}">${message}</p>
            <p>Your Score: ${correctScore} / ${shuffledQuestions.length}</p>
        `;
        resultsSummaryContainer.classList.remove('hide');

        startButton.textContent = 'Restart Exam';
        startButton.classList.remove('hide');
    }
});
