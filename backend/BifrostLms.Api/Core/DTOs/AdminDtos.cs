namespace BifrostLms.Api.Core.DTOs;

public class CreateUserDto
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string TenantId { get; set; } = default!;
}

public class UserDisplayDto
{
    public string Id { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string TenantId { get; set; } = default!;
}

public class TenantDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Domain { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateUserDto
{
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string TenantId { get; set; } = default!;
}

public class ContentDisplayDto
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string Type { get; set; } = default!; // Course, Quiz, Schedule, etc.
    public string TenantId { get; set; } = default!;
    public List<string> SharedTenantIds { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CourseShareDto
{
    public int CourseId { get; set; }
    public List<string> TenantIds { get; set; } = new();
}

public class ContentTenantUpdateDto
{
    public string EntityType { get; set; } = default!;
    public int EntityId { get; set; }
    public string NewTenantId { get; set; } = default!;
}
