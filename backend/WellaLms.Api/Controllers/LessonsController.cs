using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellaLms.Api.Core.DTOs;
using WellaLms.Api.Core.Entities;
using WellaLms.Api.Data;

namespace WellaLms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher,Admin")]
public class LessonsController : ControllerBase
{
    private readonly AppDbContext _context;

    public LessonsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Lessons/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Lesson>> GetLesson(int id)
    {
        var lesson = await _context.Lessons.FindAsync(id);

        if (lesson == null)
        {
            return NotFound();
        }

        return lesson;
    }

    // POST: api/Lessons
    [HttpPost]
    public async Task<ActionResult<Lesson>> PostLesson(CreateLessonDto dto)
    {
        // Verify course exists
        var course = await _context.Courses.FindAsync(dto.CourseId);
        if (course == null)
        {
            return BadRequest("Course not found");
        }

        var lesson = new Lesson
        {
            Title = dto.Title,
            Content = dto.Content,
            CourseId = dto.CourseId,
            VideoUrl = dto.VideoUrl,
            PdfUrl = dto.PdfUrl,
            ExternalVideoUrl = dto.ExternalVideoUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson);
    }

    // PUT: api/Lessons/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutLesson(int id, UpdateLessonDto dto)
    {
        var lesson = await _context.Lessons.FindAsync(id);

        if (lesson == null)
        {
            return NotFound();
        }

        lesson.Title = dto.Title;
        lesson.Content = dto.Content;
        lesson.VideoUrl = dto.VideoUrl;
        lesson.PdfUrl = dto.PdfUrl;
        lesson.ExternalVideoUrl = dto.ExternalVideoUrl;
        lesson.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Lessons/{id}/upload
    [HttpPost("{id}/upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(int id, [FromForm] IFormFile file, [FromForm] string type)
    {
        var lesson = await _context.Lessons.FindAsync(id);
        if (lesson == null) return NotFound();

        if (file == null || file.Length == 0) return BadRequest("File is empty");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var sanitizeFileName = file.FileName.Replace(" ", "_");
        var fileName = $"{Guid.NewGuid()}_{sanitizeFileName}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/{fileName}";

        if (type.ToLower() == "video")
        {
            lesson.VideoUrl = fileUrl;
        }
        else if (type.ToLower() == "pdf")
        {
            lesson.PdfUrl = fileUrl;
        }
        else
        {
            return BadRequest("Invalid file type");
        }

        lesson.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { url = fileUrl });
    }

    // DELETE: api/Lessons/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLesson(int id)
    {
        var lesson = await _context.Lessons.FindAsync(id);

        if (lesson == null)
        {
            return NotFound();
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
