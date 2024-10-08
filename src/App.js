
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examStatus, setExamStatus] = useState("");
  const [isViolated, setIsViolated] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [timer, setTimer] = useState(600);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isExamTerminated, setIsExamTerminated] = useState(false);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const[isTimeOut, setIsTimeOut] = useState(false);
  const[isBoxChecked, setIsBoxChecked] = useState(false);
  const[isSubmissionConfirm, setIsSubmissionConfirm] = useState(false);
  const timerRef = useRef(null);

  const questions = [
    { id: 1, question: "What is the primary purpose of React.js?", options: ["To build server-side applications", "To create dynamic user interfaces", "To manage databases", "To handle networking requests"], answer: "To create dynamic user interfaces" },
    { id: 2, question: "Which method is used to update the state in a React component?", options: ["this.setState()", "setState()", "updateState()", "changeState()"], answer: "setState()" },
    { id: 3, question: "What are props in React?", options: ["A way to modify the state of a component", "A method to pass data between components", "A keyword used to create a component", "A way to bind event handlers"], answer: "A method to pass data between components" },
    { id: 4, question: "What is a key benefit of using JSX in React?", options: ["It enhances server performance", "It allows HTML-like syntax in JavaScript files", "It enforces strict typing", "It increases the execution speed of JavaScript"], answer: "It allows HTML-like syntax in JavaScript files" },
    { id: 5, question: "What hook is used to handle side effects in functional components?", options: ["useState", "useReducer", "useEffect", "useMemo"], answer: "useEffect" }
  ];

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isExamStarted) {
        handleViolation();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isExamStarted) {
        handleViolation();
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExamStarted, violationCount]);

  const handleViolation = () => {
    if (violationCount < 2) {
      setViolationCount(prevCount => prevCount + 1);
      setShowViolationWarning(true);
      setIsViolated(true);
      setTimeout(() => setShowViolationWarning(false), 3000);
    } else {
      terminateExam();
    }
  };

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const startExam = () => {
    if (window.confirm("Are you sure you want to start the exam?")) {
      enterFullScreen();
      setIsExamStarted(true);
      setIsViolated(false);
      setViolationCount(0);
      setExamStatus("");
      setIsExamTerminated(false);
      setRandomQuestions(getRandomQuestions(5));
      startTimer();
    }
  };


  const startTimer = () => {
        timerRef.current = setInterval(() => {
          setTimer((prevTime) => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              clearInterval(timerRef.current);
              setIsTimeOut(true);
              terminateExam();
              return 0;
            }
          });
        }, 1000);
  };

  const submitExam = () => {
    setIsSubmissionConfirm(true);
  };

  const confirmSubmit = () => {
    clearInterval(timerRef.current);
    evaluateExam()
    setIsViolated(false);
    setIsExamSubmitted(true);
    exitFullScreen();
    setIsSubmissionConfirm(false);
  };

  const cancelSubmit = () => {
    setIsSubmissionConfirm(false);
    enterFullScreen();
  };

  const getRandomQuestions = (num) => {
    return [...questions].sort(() => Math.random() - 0.5).slice(0, num);
  };

  const handleAnswerChange = (questionId, option) => {
    setUserAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: option }));
  };

  const evaluateExam = () => {
    const correctAnswers = randomQuestions.filter(question => userAnswers[question.id] === question.answer).length;
    setScore(correctAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < randomQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const terminateExam = () => {
    clearInterval(timerRef.current);
    setIsExamStarted(false);
    setIsExamTerminated(true);
    exitFullScreen();
  };

  const resetExam = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setRandomQuestions(getRandomQuestions(5));
    setIsViolated(false);
  };

  const resumeExam = () => {
      setIsViolated(false);
      enterFullScreen();
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="App">
      <h1 className='heading'>Frontend Exam</h1>
      {!isExamStarted && !isExamSubmitted && !isExamTerminated ? (
        <div className='start-page'>
          <div className='instructions'>
            <h3>Instructions</h3>
            <ol>
              <li>The exam duration is limited to 10 minutes.</li>
              <li>You can reset the exam at any time before submission.</li>
              <li>If you violate the exam rules, you will receive a warning.</li>
              <li>Only one warning is valid; if you violate a second time, the exam will be automatically terminated.</li>
            </ol>
          </div>

          <div className='checkbox'>
            <label>
              <input type='checkbox' checked={isBoxChecked} onChange={(e) => setIsBoxChecked(e.target.value)} />
              I have read the instructions and am ready to take the exam.
            </label>
          </div>
          <button onClick={startExam} className='start-button' disabled={!isBoxChecked}>Start Exam</button>
          {examStatus && <h2>{examStatus}</h2>}
        </div>
      ) : isTimeOut ? (
        <div className='time-out'>
          <p>You have ran out of time.</p>
          <p>The attempted questions are considered for evaluation.</p>
        </div>
      ) : (
        <p>
          {isExamTerminated ? (
            <p className='violation-msg'>Exam got terminated due to multiple violations</p>
          ) : isExamSubmitted ? (
            <div>
              <p className="success-status">Thank you for attempting the exam.</p>
              <p className="success-status">You scored {score} out of 5.</p>
            </div>
          ) : (
            <>
              <h2>Exam in progress</h2>
              <div className="timer">Time Left: {formatTime(timer)}</div>

              {!isViolated && !showViolationWarning && (
                <div className="questions-container">
                <div key={randomQuestions[currentQuestionIndex].id} className="question-box">
                  <h3>{randomQuestions[currentQuestionIndex].question}</h3>
                  <div className='options-container'>
                    {randomQuestions[currentQuestionIndex].options.map((option, index) => (
                      <div key={option} className="option">
                        <label style={{ marginLeft: "10px" }}>
                          <input
                            type="radio"
                            name={`question-${randomQuestions[currentQuestionIndex].id}`}
                            value={option}
                            checked={userAnswers[randomQuestions[currentQuestionIndex].id] === option}
                            onChange={() => handleAnswerChange(randomQuestions[currentQuestionIndex].id, option)}
                          />
                          <span style={{ marginLeft: "10px" }}>{`${index + 1}. ${option}`}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='navigation-buttons'>
                  {currentQuestionIndex > 0 && <button onClick={handlePrevQuestion}>Prev</button>}
                  {currentQuestionIndex < randomQuestions.length - 1 && <button onClick={handleNextQuestion}>Next</button>}
                  <button onClick={resetExam}>Reset Exam</button>
                </div>
                {currentQuestionIndex === randomQuestions.length - 1 && (
                  <button onClick={submitExam}>Submit Exam</button>
                )}
              </div>
              )}
              {showViolationWarning && <p className='violation-msg'>Violation warning: Do not exit full-screen mode! Violation: {violationCount}/2</p>}
              {isViolated && !showViolationWarning && <button onClick={resumeExam}>Resume Exam</button>}
              {isSubmissionConfirm && (
                <div>
                  <p> Are you sure you want to submit ?</p>
                  <button onClick={confirmSubmit}>Yes</button>
                  <button onClick={cancelSubmit}>No</button>
                </div>
              )}
              
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default App;


