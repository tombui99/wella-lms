namespace BifrostLms.Api.Core.Entities;

using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

public interface IMultiTenant
{
    string? TenantId { get; set; }
}

public class ApplicationUser : IdentityUser, IMultiTenant
{
    public string? FullName { get; set; }
    public string? TenantId { get; set; } // For multi-tenancy if needed per user
}

public abstract class BaseEntity : IMultiTenant
{
    public int Id { get; set; }
    public string? TenantId { get; set; } // For multi-tenancy
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class Tenant
{
    public string Id { get; set; } = default!; // e.g., "tenant-1"
    public string Name { get; set; } = default!;
    public string? Domain { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Course : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public List<Lesson> Lessons { get; set; } = new();
    public List<CourseTenant> SharedWithTenants { get; set; } = new();
}

public class CourseTenant
{
    public int CourseId { get; set; }
    [JsonIgnore]
    public Course Course { get; set; } = default!;
    public string TenantId { get; set; } = default!;
}

public class Lesson : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public string? PdfUrl { get; set; }
    public string? ExternalVideoUrl { get; set; }
    public int CourseId { get; set; }
    [JsonIgnore]
    public Course Course { get; set; } = default!;
}

public class Schedule : BaseEntity
{
    public string Title { get; set; } = default!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
}

public class Resource : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Url { get; set; }
    public string? Type { get; set; } // Document, Video, etc.
}

public class StudentProgress : BaseEntity
{
    public string StudentId { get; set; } = default!;
    public ApplicationUser Student { get; set; } = default!;
    public int CourseId { get; set; }
    public Course Course { get; set; } = default!;
    public int ProgressPercentage { get; set; }
    public double Score { get; set; }
}

public class LessonProgress : BaseEntity
{
    public string StudentId { get; set; } = default!;
    public ApplicationUser Student { get; set; } = default!;
    public int LessonId { get; set; }
    public Lesson Lesson { get; set; } = default!;
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class Quiz : BaseEntity
{
    public int CourseId { get; set; }
    public Course Course { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public List<Question> Questions { get; set; } = new();
}

public class Question : BaseEntity
{
    public int QuizId { get; set; }
    [JsonIgnore]
    public Quiz Quiz { get; set; } = default!;
    public string Text { get; set; } = default!;
    public List<Choice> Choices { get; set; } = new();
}

public class Choice : BaseEntity
{
    public int QuestionId { get; set; }
    [JsonIgnore]
    public Question Question { get; set; } = default!;
    public string Text { get; set; } = default!;
    public bool IsCorrect { get; set; }
}

public class QuizAttempt : BaseEntity
{
    public string StudentId { get; set; } = default!;
    public ApplicationUser Student { get; set; } = default!;
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = default!;
    public double Score { get; set; }
    public bool IsPassed { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}