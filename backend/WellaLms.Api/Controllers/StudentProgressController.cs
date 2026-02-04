using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellaLms.Api.Core.DTOs;
using WellaLms.Api.Core.Entities;
using WellaLms.Api.Data;
using System.IdentityModel.Tokens.Jwt;


namespace WellaLms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentProgressController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<StudentProgressController> _logger;

    public StudentProgressController(AppDbContext context, ILogger<StudentProgressController> logger)
    {
        _context = context;
        _logger = logger;
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
            .Include(c => c.Lessons)
            .ToListAsync();

        var progresses = await _context.StudentProgresses
            .Where(p => p.StudentId == userId)
            .ToListAsync();

        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.StudentId == userId)
            .ToListAsync();

        var result = courses.Select(c => {
            var progress = progresses.FirstOrDefault(p => p.CourseId == c.Id);
            return new CourseProgressDto
            {
                CourseId = c.Id,
                CourseTitle = c.Title,
                ProgressPercentage = progress?.ProgressPercentage ?? 0,
                IsStarted = progress != null,
                Lessons = c.Lessons.Select(l => {
                    var lp = lessonProgresses.FirstOrDefault(p => p.LessonId == l.Id);
                    return new LessonProgressDto
                    {
                        LessonId = l.Id,
                        LessonTitle = l.Title,
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
            .Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return NotFound("Course not found");

        var progress = await _context.StudentProgresses
            .FirstOrDefaultAsync(p => p.StudentId == userId && p.CourseId == courseId);

        var lessonProgresses = await _context.LessonProgresses
            .Where(lp => lp.StudentId == userId && course.Lessons.Select(l => l.Id).Contains(lp.LessonId))
            .ToListAsync();

        var result = new CourseProgressDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            ProgressPercentage = progress?.ProgressPercentage ?? 0,
            IsStarted = progress != null,
            Lessons = course.Lessons.Select(l => {
                var lp = lessonProgresses.FirstOrDefault(p => p.LessonId == l.Id);
                return new LessonProgressDto
                {
                    LessonId = l.Id,
                    LessonTitle = l.Title,
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

        // Update Course Progress
        var courseId = lesson.CourseId;
        var totalLessons = lesson.Course.Lessons.Count;
        var completedLessons = await _context.LessonProgresses
            .Where(lp => lp.StudentId == userId && lesson.Course.Lessons.Select(l => l.Id).Contains(lp.LessonId) && lp.IsCompleted)
            .CountAsync();

        var studentProgress = await _context.StudentProgresses
            .FirstOrDefaultAsync(p => p.StudentId == userId && p.CourseId == courseId);

        if (studentProgress != null)
        {
            studentProgress.ProgressPercentage = (int)((double)completedLessons / totalLessons * 100);
            studentProgress.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(new { ProgressPercentage = studentProgress?.ProgressPercentage ?? 0 });
    }
}
