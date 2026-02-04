namespace WellaLms.Api.Core.DTOs;

public class LessonProgressDto
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = default!;
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CourseProgressDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = default!;
    public int ProgressPercentage { get; set; }
    public bool IsStarted { get; set; }
    public List<LessonProgressDto> Lessons { get; set; } = new();
}

public class MarkLessonCompletedDto
{
    public int LessonId { get; set; }
}
