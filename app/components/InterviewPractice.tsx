"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import SpeechRecognition from "./SpeechRecognition"
import { processSpeech } from "../actions/processSpeech"

const recruiterQuestions = [
  "Tell me about yourself and your background.",
  "Why are you interested in this position?",
  "What do you know about our company?",
  "Can you walk me through your resume?",
  "What are your salary expectations?",
  "Why are you looking to leave your current role?",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
  "Do you have any questions for me about the role or company?",
]

export default function InterviewPractice() {
  const [feedback, setFeedback] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSpeechRecognition, setShowSpeechRecognition] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Check if speech recognition is supported
      if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
        setError("Speech recognition is not supported in this browser.")
      }
    }
  }, [])

  const handleSpeechResult = async (result: string) => {
    console.log("Speech recognition result:", result)
    if (!result.trim()) {
      setFeedback("No speech was detected. Please try again.")
      setShowSpeechRecognition(false)
      return
    }
    setIsProcessing(true)
    try {
      const response = await processSpeech(recruiterQuestions[currentQuestionIndex], result)
      setFeedback(response)
    } catch (error) {
      console.error("Error processing speech:", error)
      setError("An error occurred while processing your answer. Please try again.")
    }
    setIsProcessing(false)
    setShowSpeechRecognition(false)
  }

  const handleSpeechError = (error: string) => {
    console.error("Speech recognition error:", error)
    setError(error)
    setShowSpeechRecognition(false)
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % recruiterQuestions.length)
    setFeedback("")
    setShowSpeechRecognition(false)
    setError(null)
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => setError(null)} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{recruiterQuestions[currentQuestionIndex]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showSpeechRecognition && !isProcessing && (
          <Button onClick={() => setShowSpeechRecognition(true)}>Start Recording</Button>
        )}
        {showSpeechRecognition && <SpeechRecognition onResult={handleSpeechResult} onError={handleSpeechError} />}
        {isProcessing && <p>Processing your answer...</p>}
        {feedback && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
            <div dangerouslySetInnerHTML={{ __html: feedback }} />
          </div>
        )}
        <Button onClick={handleNextQuestion} disabled={isProcessing}>
          Next Question
        </Button>
      </CardContent>
    </Card>
  )
}
