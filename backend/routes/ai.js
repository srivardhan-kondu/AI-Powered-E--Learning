const express = require('express');
const OpenAI = require('openai');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get AI explanation for incorrect answers
router.post('/explain', auth, async (req, res) => {
  try {
    const { resultId } = req.body;
    const result = await Result.findById(resultId).populate('quiz').populate('course', 'title');
    if (!result) return res.status(404).json({ message: 'Result not found.' });

    const incorrectAnswers = result.answers
      .filter(a => !a.isCorrect)
      .map(a => {
        const q = result.quiz.questions[a.questionIndex];
        return {
          question: q.question,
          yourAnswer: q.options[a.selectedAnswer],
          correctAnswer: q.options[q.correctAnswer],
        };
      });

    if (incorrectAnswers.length === 0) {
      return res.json({ explanations: 'Congratulations! You answered all questions correctly!', recommendations: [] });
    }

    const prompt = `You are an expert tutor on an e-learning platform. A student just completed a quiz titled "${result.quiz.title}" in the course "${result.course.title}" and got ${result.score}/${result.totalQuestions} correct (${result.percentage}%).

Here are the questions they got wrong:

${incorrectAnswers.map((a, i) => `${i + 1}. Question: ${a.question}
   Student's Answer: ${a.yourAnswer}
   Correct Answer: ${a.correctAnswer}`).join('\n\n')}

Please provide:
1. A clear, concise explanation for each incorrect answer (why the correct answer is right and why their answer was wrong).
2. 3-5 personalized study recommendations based on the topics they struggled with.

Format your response as JSON with this structure:
{
  "explanations": [
    { "question": "...", "explanation": "..." }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    let aiResponse;
    try {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiResponse = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      aiResponse = { explanations: completion.choices[0].message.content, recommendations: [] };
    }

    res.json(aiResponse);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to generate AI feedback.' });
  }
});

// Get personalized feedback for dashboard
router.post('/feedback', auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title')
      .populate('course', 'title')
      .sort({ completedAt: -1 })
      .limit(10);

    if (results.length === 0) {
      return res.json({
        feedback: 'Start taking quizzes to receive personalized AI feedback!',
        strengths: [],
        improvements: [],
        studyPlan: []
      });
    }

    const summary = results.map(r =>
      `Quiz: "${r.quiz?.title}" (Course: "${r.course?.title}") - Score: ${r.percentage}%`
    ).join('\n');

    const avgScore = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);

    const prompt = `You are an AI learning advisor. A student has the following recent quiz performance:

${summary}

Overall average: ${avgScore}%

Based on this performance data, provide:
1. A brief overall assessment (2-3 sentences)
2. Their top strengths (topics they're doing well in)
3. Areas for improvement (topics they need to study more)
4. A personalized study plan with 3-5 actionable steps

Format as JSON:
{
  "feedback": "overall assessment...",
  "strengths": ["strength 1", ...],
  "improvements": ["area 1", ...],
  "studyPlan": ["step 1", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    let aiResponse;
    try {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiResponse = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      aiResponse = { feedback: completion.choices[0].message.content, strengths: [], improvements: [], studyPlan: [] };
    }

    res.json(aiResponse);
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to generate feedback.' });
  }
});

module.exports = router;
