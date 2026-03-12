const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin stats overview
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalQuizzes, totalResults] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Quiz.countDocuments(),
      Result.countDocuments()
    ]);

    const results = await Result.find();
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

    res.json({ totalUsers, totalCourses, totalQuizzes, totalResults, avgScore });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('enrolledCourses', 'title')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin user.' });
    await Result.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all courses (admin view with extra info)
router.get('/courses', adminAuth, async (req, res) => {
  try {
    const courses = await Course.find().select('-topics.subtopics.content');
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const quizCount = await Quiz.countDocuments({ course: course._id });
      const enrollCount = await User.countDocuments({ enrolledCourses: course._id });
      return { ...course.toObject(), quizCount, enrollCount };
    }));
    res.json(coursesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete course
router.delete('/courses/:id', adminAuth, async (req, res) => {
  try {
    await Quiz.deleteMany({ course: req.params.id });
    await Result.deleteMany({ course: req.params.id });
    await User.updateMany({}, { $pull: { enrolledCourses: req.params.id } });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course and related data deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all quizzes (admin)
router.get('/quizzes', adminAuth, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
      const attempts = await Result.countDocuments({ quiz: quiz._id });
      const results = await Result.find({ quiz: quiz._id });
      const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0;
      return { ...quiz.toObject(), attempts, avgScore };
    }));
    res.json(quizzesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete quiz
router.delete('/quizzes/:id', adminAuth, async (req, res) => {
  try {
    await Result.deleteMany({ quiz: req.params.id });
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all results (admin)
router.get('/results', adminAuth, async (req, res) => {
  try {
    const results = await Result.find()
      .populate('user', 'name email')
      .populate('quiz', 'title')
      .populate('course', 'title')
      .sort({ completedAt: -1 })
      .limit(50);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
