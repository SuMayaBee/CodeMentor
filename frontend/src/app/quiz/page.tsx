'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface QuizQuestion {
  number: number;
  question: string;
  options: { letter: string; text: string }[];
  answer: string;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<QuizQuestion[]>([]);
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const parseQuestions = (content: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    const lines = content.split('\n');
    let currentQuestion: Partial<QuizQuestion> = {};
    let options: { letter: string; text: string }[] = [];

    lines.forEach(line => {
      // Match question number and text
      const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (questionMatch) {
        if (currentQuestion.question) {
          questions.push({ ...currentQuestion, options } as QuizQuestion);
          options = [];
        }
        currentQuestion = {
          number: parseInt(questionMatch[1]),
          question: questionMatch[2].trim()
        };
      }
      
      // Match options
      const optionMatch = line.match(/^\s*-\s*([a-d])\)\s*(.*)/i);
      if (optionMatch) {
        options.push({
          letter: optionMatch[1].toUpperCase(),
          text: optionMatch[2].trim()
        });
      }

      // Match answer
      const answerMatch = line.match(/\/box\((\d+)([A-D])\)/);
      if (answerMatch && currentQuestion.number === parseInt(answerMatch[1])) {
        currentQuestion.answer = answerMatch[2];
      }
    });

    // Add last question
    if (currentQuestion.question) {
      questions.push({ ...currentQuestion, options } as QuizQuestion);
    }

    return questions;
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
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [searchParams]);

  const handleAnswer = (letter: string) => {
    const question = questions[currentQuestion];
    const isCorrect = letter === question.answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setWrongAnswers(prev => [...prev, question]);
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: letter
    }));

    // Don't auto-advance to next question
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const finalScore = (score / questions.length) * 100;
      setShowResults(true);
      
      if (finalScore < 80) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
  };

  const handleRetry = async () => {
    if (wrongAnswers.length > 0) {
      const wrong_questions = wrongAnswers.map(q => 
        `${q.question}\n${q.options.map(o => `${o.letter}) ${o.text}`).join('\n')}`
      ).join('\n\n');

      const response = await fetch('http://localhost:8000/newcontent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "",
          topic: searchParams.get('topic'),
          chat_history: [
            {
              role: "human",
              content: "I need help understanding these questions I got wrong:",
            },
            {
              role: "human",
              content: wrong_questions
            }
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const queryParams = new URLSearchParams({
          topic: searchParams.get('topic') || '',
          chatHistory: encodeURIComponent(JSON.stringify(data.chat_history))
        }).toString();
        window.location.href = `/topic-details?${queryParams}`;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

 
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6"
      >
        <div className="max-w-2xl mx-auto bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl p-8">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 mb-8">
              <CircularProgressbar
                value={percentage}
                text={`${percentage}%`}
                styles={buildStyles({
                  pathColor: percentage >= 80 ? '#10B981' : '#EF4444',
                  textColor: '#8B5CF6',
                  trailColor: 'rgba(139, 92, 246, 0.1)',
                })}
              />
            </div>
            <motion.h2 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-violet-400 mb-4"
            >
              Quiz Results
            </motion.h2>
            <p className="text-xl text-gray-300 mb-6">
              {percentage >= 80 ? 'Great job! 🎉' : 'Let\'s try again! 💪'}
            </p>
            {percentage < 80 && (
              <p className="text-sm text-violet-400 animate-pulse">
                Generating new quiz...
              </p>
            )}
            {percentage >= 80 && (
              <button
                onClick={handleRetry}
                className="w-full px-6 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all"
              >
                {wrongAnswers.length > 0 ? 'Review Wrong Answers' : 'Return to Topics'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-violet-950/20 to-gray-950 p-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
  
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header with progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <CircularProgressbar
                value={(currentQuestion + 1) / questions.length * 100}
                text={`${currentQuestion + 1}/${questions.length}`}
                styles={buildStyles({
                  pathColor: '#8B5CF6',
                  textColor: '#8B5CF6',
                  trailColor: 'rgba(139, 92, 246, 0.1)',
                })}
              />
            </div>
            <div className="text-violet-400 font-medium">
              Progress
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-violet-400 font-medium">Score</div>
            <div className="w-16 h-16">
              <CircularProgressbar
                value={(score / questions.length) * 100}
                text={`${score}`}
                styles={buildStyles({
                  pathColor: '#10B981',
                  textColor: '#8B5CF6',
                  trailColor: 'rgba(139, 92, 246, 0.1)',
                })}
              />
            </div>
          </div>
        </div>
  
        {/* Question card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/30 border border-violet-500/20 backdrop-blur-sm rounded-xl overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-b border-violet-500/20">
            <h2 className="text-xl font-medium text-gray-200">
              {question.question}
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {question.options.map(option => {
              const isAnswered = userAnswers[currentQuestion] !== undefined;
              const isSelected = userAnswers[currentQuestion] === option.letter;
              const isCorrect = option.letter === question.answer;
  
              return (
                <motion.button
                  key={option.letter}
                  onClick={() => !isAnswered && handleAnswer(option.letter)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4
                    ${isAnswered
                      ? isCorrect
                        ? 'bg-green-500/20 border border-green-500/30'
                        : isSelected
                          ? 'bg-red-500/20 border border-red-500/30'
                          : 'opacity-50'
                      : 'hover:bg-violet-500/20 border border-violet-500/20'
                    } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <span className="text-violet-300 font-medium">{option.letter}</span>
                  </span>
                  <span className="text-gray-300">{option.text}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
  
        {/* Next button */}
        {userAnswers[currentQuestion] !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 
                       transition-all flex items-center gap-2"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}