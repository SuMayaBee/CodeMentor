'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface QuizQuestion {
  question: string;
  options: { label: string; text: string }[];
  answer: string;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState<{[key: number]: boolean}>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<QuizQuestion[]>([]);

  const parseQuestions = (content: string): QuizQuestion[] => {
    const questionRegex = /\(\((.*?)\)\)\s*\/box\((\d+[A-D])\)/g;
    const questions: QuizQuestion[] = [];
    let match;

    while ((match = questionRegex.exec(content)) !== null) {
      try {
        const [, questionText, answer] = match;
        const [questionPart, ...optionLines] = questionText.split('*');
        const options = optionLines
          .filter(line => line && line.includes(')'))
          .map(line => {
            const [label, ...text] = line.split(') ');
            return { 
              label: label?.trim() || '',
              text: text.join(') ').trim() 
            };
          });

        const question = questionPart.split('.')[1]?.trim() || questionPart;
        if (question && options.length > 0) {
          questions.push({ question, options, answer });
        }
      } catch (error) {
        console.error('Error parsing question:', error);
      }
    }
    return questions;
  };

  const handleAnswerSelect = (index: number, selectedOption: string) => {
    const answer = `${index + 1}${selectedOption.toUpperCase()}`;
    setSelectedAnswers(prev => ({ ...prev, [index]: answer }));
    setShowResults(prev => ({ ...prev, [index]: true }));
    
    if (answer === questions[index].answer) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, questions[index]]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleReturn = async () => {
    try {
      if (wrongAnswers.length > 0) {
        const wrong_questions = wrongAnswers
          .map(q => `${q.question}\nOptions:\n${q.options.map(o => `${o.label}) ${o.text}`).join('\n')}`)
          .join('\n\n');

        const chatHistory = [
          {
            role: "human",
            content: "You are a mentor who teaches step-by-step, interactively and adaptively. Use the provided context to explain the topic clearly. Also generate a question after each time u are teaching something. I didn't understand the following questions i got them wrong"
          },
          {
            role: "human",
            content: wrong_questions
          }
        ];

        const response = await fetch('http://localhost:8000/newcontent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "",
            topic: searchParams.get('topic'),
            chat_history: chatHistory
          }),
        });

        if (!response.ok) throw new Error('Failed to submit answers');
        const data = await response.json();
        
        const queryParams = new URLSearchParams({
          topic: searchParams.get('topic') || '',
          chatHistory: encodeURIComponent(JSON.stringify(data.chat_history))
        }).toString();
        
        window.location.href = `/topic-details?${queryParams}`;
      } else {
        window.location.href = '/topic-details';
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const chatHistory = JSON.parse(decodeURIComponent(searchParams.get('chatHistory') || '[]'));
        const response = await fetch('http://localhost:8000/newcontent/take_quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_history: chatHistory }),
        });

        if (!response.ok) throw new Error('Failed to fetch quiz');
        const data = await response.json();
        const parsedQuestions = parseQuestions(data.response);
        if (parsedQuestions.length === 0) throw new Error('No questions found');
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-violet-400">Loading Quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-red-400">Failed to load questions. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        {quizCompleted ? (
          <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-violet-400 mb-4">Quiz Completed!</h2>
            <p className="text-xl text-gray-300 mb-6">Your Score: {score} / {questions.length}</p>
            <button
              onClick={handleReturn}
              className="px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all"
            >
              Return to Topics
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
                Quiz Progress
              </h1>
              <div className="text-violet-400">
                Question {currentQuestionIndex + 1} of {questions.length} | Score: {score}
              </div>
            </div>

            <div className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-white/90 font-medium mb-8 text-lg">
                {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
              </p>

              <div className="space-y-4">
                {questions[currentQuestionIndex].options.map((option) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === 
                    `${currentQuestionIndex + 1}${option.label.toUpperCase()}`;
                  const showResult = showResults[currentQuestionIndex];
                  const isCorrect = `${currentQuestionIndex + 1}${option.label.toUpperCase()}` === 
                    questions[currentQuestionIndex].answer;

                  return (
                    <label
                      key={option.label}
                      className={`flex items-center p-4 rounded-xl cursor-pointer transition-all
                        ${isSelected && showResult 
                          ? (isCorrect 
                            ? 'bg-green-500/20 border border-green-400/30' 
                            : 'bg-red-500/20 border border-red-400/30')
                          : 'hover:bg-violet-500/10 border border-violet-500/20'}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option.label}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestionIndex, option.label)}
                        className="w-4 h-4 text-violet-500 bg-gray-900 border-violet-400/30"
                        disabled={showResult}
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-gray-300">
                          {option.label}) {option.text}
                        </span>
                        {showResult && isCorrect && (
                          <span className="ml-2 text-green-400">(Correct Answer)</span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="ml-2 text-red-400">(Incorrect)</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {showResults[currentQuestionIndex] && (
                <div className="mt-6 p-4 bg-violet-500/10 border border-violet-400/30 rounded-xl">
                  <p className="text-violet-300">
                    <span className="font-semibold">Correct Answer:</span>{' '}
                    Option {questions[currentQuestionIndex].answer.slice(-1)}
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-violet-500/20 border border-violet-400/30 text-violet-300 
                           rounded-xl disabled:opacity-50 hover:bg-violet-500/30 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestionIndex]}
                  className="px-6 py-3 bg-violet-500 text-white rounded-xl 
                           disabled:opacity-50 hover:bg-violet-600 transition-all"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}