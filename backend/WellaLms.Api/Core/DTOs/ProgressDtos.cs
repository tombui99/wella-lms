namespace WellaLms.Api.Core.DTOs;

public class LessonProgressDto
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = default!;
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public string? PdfUrl { get; set; }
    public string? ExternalVideoUrl { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CourseProgressDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = default!;
    public int ProgressPercentage { get; set; }
    public bool IsStarted { get; set; }
    public int? QuizId { get; set; }
    public bool HasQuiz { get; set; }
    public bool IsQuizPassed { get; set; }
    public List<LessonProgressDto> Lessons { get; set; } = new();
}

public class MarkLessonCompletedDto
{
    public int LessonId { get; set; }
}
