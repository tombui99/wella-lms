namespace BifrostLms.Api.Core.DTOs;

public record CreateCourseDto(string Title, string? Description, string? ImageUrl, bool IsApproved = false);
public record UpdateCourseDto(string Title, string? Description, string? ImageUrl, bool IsApproved);
