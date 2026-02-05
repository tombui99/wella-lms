using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellaLms.Api.Core.DTOs;
using WellaLms.Api.Core.Entities;
using WellaLms.Api.Data;
using System.IdentityModel.Tokens.Jwt;


using WellaLms.Api.Core.Services;

namespace WellaLms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentProgressController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<StudentProgressController> _logger;
    private readonly IProgressService _progressService;

    public StudentProgressController(AppDbContext context, ILogger<StudentProgressController> logger, IProgressService progressService)
    {
        _context = context;
        _logger = logger;
        _progressService = progressService;
    }

    private string? GetUserId()
    {
        // Try multiple claim types to be safe
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                  ?? User.FindFirst("sub")?.Value 
                  ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        
        if (userId == null)
        {
            _logger.LogWarning("User ID claim not found. Available claims: {Claims}", 
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
        }
        return userId;
    }


    [HttpGet("courses")]
    public async Task<ActionResult<IEnumerable<CourseProgressDto>>> GetMyCourses()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var courses = await _context.Courses
            .Include(c => c.Lessons.OrderBy(l => l.CreatedAt))
            .ToListAsync();

        var progresses = await _context.StudentProgresses
            .Where(p => p.StudentId == userId)
            .ToListAsync();

        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.StudentId == userId)
            .ToListAsync();

        var quizzes = await _context.Quizzes.ToListAsync();
        var quizAttempts = await _context.QuizAttempts
            .Where(qa => qa.StudentId == userId && qa.IsPassed)
            .ToListAsync();

        var result = courses.Select(c => {
            var progress = progresses.FirstOrDefault(p => p.CourseId == c.Id);
            var quiz = quizzes.FirstOrDefault(q => q.CourseId == c.Id);
            var lastPassAttempt = quizAttempts.FirstOrDefault(qa => qa.QuizId == quiz?.Id);
            
            return new CourseProgressDto
            {
                CourseId = c.Id,
                CourseTitle = c.Title,
                ProgressPercentage = progress?.ProgressPercentage ?? 0,
                IsStarted = progress != null,
                QuizId = quiz?.Id,
                HasQuiz = quiz != null,
                IsQuizPassed = lastPassAttempt != null,
                Lessons = c.Lessons.Select(l => {
                    var lp = lessonProgresses.FirstOrDefault(p => p.LessonId == l.Id);
                    return new LessonProgressDto
                    {
                        LessonId = l.Id,
                        LessonTitle = l.Title,
                        Content = l.Content,
                        VideoUrl = l.VideoUrl,
                        PdfUrl = l.PdfUrl,
                        ExternalVideoUrl = l.ExternalVideoUrl,
                        IsCompleted = lp?.IsCompleted ?? false,
                        CompletedAt = lp?.CompletedAt
                    };
                }).ToList()
            };
        });

        return Ok(result);
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<CourseProgressDto>> GetCourseProgress(int courseId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var course = await _context.Courses
            .Include(c => c.Lessons.OrderBy(l => l.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return NotFound("Course not found");

        var progress = await _context.StudentProgresses
            .FirstOrDefaultAsync(p => p.StudentId == userId && p.CourseId == courseId);

        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.StudentId == userId && course.Lessons.Select(l => l.Id).Contains(lp.LessonId))
            .ToListAsync();

        var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.CourseId == courseId);
        var isQuizPassed = quiz != null && await _context.QuizAttempts
            .AnyAsync(qa => qa.StudentId == userId && qa.QuizId == quiz.Id && qa.IsPassed);

        var result = new CourseProgressDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            ProgressPercentage = progress?.ProgressPercentage ?? 0,
            IsStarted = progress != null,
            QuizId = quiz?.Id,
            HasQuiz = quiz != null,
            IsQuizPassed = isQuizPassed,
            Lessons = course.Lessons.Select(l => {
                var lp = lessonProgresses.FirstOrDefault(p => p.LessonId == l.Id);
                return new LessonProgressDto
                {
                    LessonId = l.Id,
                    LessonTitle = l.Title,
                    Content = l.Content,
                    VideoUrl = l.VideoUrl,
                    PdfUrl = l.PdfUrl,
                    ExternalVideoUrl = l.ExternalVideoUrl,
                    IsCompleted = lp?.IsCompleted ?? false,
                    CompletedAt = lp?.CompletedAt
                };
            }).ToList()
        };

        return Ok(result);
    }

    [HttpPost("course/{courseId}/start")]
    public async Task<IActionResult> StartCourse(int courseId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return NotFound("Course not found");

        var progress = await _context.StudentProgresses
            .FirstOrDefaultAsync(p => p.StudentId == userId && p.CourseId == courseId);

        if (progress == null)
        {
            progress = new StudentProgress
            {
                StudentId = userId,
                CourseId = courseId,
                ProgressPercentage = 0,
                CreatedAt = DateTime.UtcNow
            };
            _context.StudentProgresses.Add(progress);
            await _context.SaveChangesAsync();
        }

        return Ok();
    }

    [HttpPost("lesson/{lessonId}/complete")]
    public async Task<IActionResult> CompleteLesson(int lessonId)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var lesson = await _context.Lessons
            .Include(l => l.Course)
            .ThenInclude(c => c.Lessons)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null) return NotFound("Lesson not found");

        var lessonProgress = await _context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.StudentId == userId && lp.LessonId == lessonId);

        if (lessonProgress == null)
        {
            lessonProgress = new LessonProgress
            {
                StudentId = userId,
                LessonId = lessonId,
                IsCompleted = true,
                CompletedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _context.LessonProgresses.Add(lessonProgress);
        }
        else
        {
            lessonProgress.IsCompleted = true;
            lessonProgress.CompletedAt = DateTime.UtcNow;
            lessonProgress.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await _progressService.UpdateStudentProgressAsync(userId, lesson.CourseId);

        var studentProgress = await _context.StudentProgresses
            .FirstOrDefaultAsync(p => p.StudentId == userId && p.CourseId == lesson.CourseId);

        return Ok(new { ProgressPercentage = studentProgress?.ProgressPercentage ?? 0 });
    }

    [HttpGet("quiz/{quizId}")]
    public async Task<ActionResult<QuizDto>> GetQuiz(int quizId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Choices)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) return NotFound("Quiz not found");

        // Return quiz without showing which choice is correct to the student
        return Ok(new QuizDto
        {
            Id = quiz.Id,
            Title = quiz.Title,
            Description = quiz.Description,
            Questions = quiz.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Choices = q.Choices.Select(c => new ChoiceDto
                {
                    Id = c.Id,
                    Text = c.Text,
                    IsCorrect = false // Don't leak the correct answer
                }).ToList()
            }).ToList()
        });
    }

    [HttpPost("quiz/{quizId}/submit")]
    public async Task<ActionResult<QuizResultDto>> SubmitQuiz(int quizId, QuizSubmissionDto submission)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Choices)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) return NotFound("Quiz not found");

        int correctAnswers = 0;
        foreach (var answer in submission.Answers)
        {
            var question = quiz.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question != null)
            {
                var correctChoice = question.Choices.FirstOrDefault(c => c.IsCorrect);
                if (correctChoice != null && correctChoice.Id == answer.SelectedChoiceId)
                {
                    correctAnswers++;
                }
            }
        }

        double score = quiz.Questions.Count > 0 ? (double)correctAnswers / quiz.Questions.Count * 100 : 0;
        bool isPassed = score > 50;

        var attempt = new QuizAttempt
        {
            StudentId = userId,
            QuizId = quizId,
            Score = score,
            IsPassed = isPassed,
            CompletedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.QuizAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        if (isPassed)
        {
            await _progressService.UpdateStudentProgressAsync(userId, quiz.CourseId);
        }

        return Ok(new QuizResultDto { Score = score, IsPassed = isPassed });
    }
}
