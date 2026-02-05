namespace WellaLms.Api.Core.DTOs;

public record LessonDto(int Id, string Title, string? Content, string? VideoUrl, string? PdfUrl, string? ExternalVideoUrl, int CourseId, DateTime CreatedAt, DateTime? UpdatedAt);
public record CreateLessonDto(string Title, string? Content, int CourseId, string? VideoUrl = null, string? PdfUrl = null, string? ExternalVideoUrl = null);
public record UpdateLessonDto(string Title, string? Content, string? VideoUrl = null, string? PdfUrl = null, string? ExternalVideoUrl = null);
