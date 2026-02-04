namespace WellaLms.Api.Core.Entities;

using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? TenantId { get; set; } // For multi-tenancy if needed per user
}

public abstract class BaseEntity
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
    public bool IsActive { get; set; } = true;
}

public class Course : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public List<Lesson> Lessons { get; set; } = new();
}

public class Lesson : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Content { get; set; }
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
}

public class ForumPost : BaseEntity
{
    public string Title { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string Author { get; set; } = default!;
}

public class Resource : BaseEntity
{
    public string Title { get; set; } = default!;
    public string? Url { get; set; }
    public string? Type { get; set; } // Document, Video, etc.
}

public class TrainingProgram : BaseEntity
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
}

public class FAQ : BaseEntity
{
    public string Question { get; set; } = default!;
    public string Answer { get; set; } = default!;
}

public class Notification : BaseEntity
{
    public string Message { get; set; } = default!;
    public bool IsRead { get; set; }
    public string? TargetUser { get; set; }
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

