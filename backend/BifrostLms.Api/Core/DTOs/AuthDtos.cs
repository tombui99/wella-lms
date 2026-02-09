namespace BifrostLms.Api.Core.DTOs;

public class LoginDto
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
}

public class RegisterDto
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Role { get; set; } = "Student"; // Default role
}

public class AuthResponseDto
{
    public string Token { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string TenantId { get; set; } = default!;
}
