using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BifrostLms.Api.Core.DTOs;
using BifrostLms.Api.Core.Entities;
using BifrostLms.Api.Data;

namespace BifrostLms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Courses - Public endpoint for all users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
    {
        var query = _context.Courses.Include(c => c.Lessons.OrderBy(l => l.CreatedAt)).AsQueryable();

        if (User.IsInRole("Student"))
        {
            query = query.Where(c => c.IsApproved);
        }

        return await query.ToListAsync();
    }

    // GET: api/Courses/{id} - Public endpoint for all users
    [HttpGet("{id}")]
    public async Task<ActionResult<Course>> GetCourse(int id)
    {
        var query = _context.Courses.Include(c => c.Lessons.OrderBy(l => l.CreatedAt)).AsQueryable();

        if (User.IsInRole("Student"))
        {
            query = query.Where(c => c.IsApproved);
        }

        var course = await query.FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
        {
            return NotFound();
        }

        return course;
    }

    // POST: api/Courses - Teachers and Admins only
    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<ActionResult<Course>> PostCourse(CreateCourseDto dto)
    {
        var course = new Course
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            IsApproved = dto.IsApproved,
            CreatedAt = DateTime.UtcNow
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    // PUT: api/Courses/{id} - Teachers and Admins only
    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> PutCourse(int id, UpdateCourseDto dto)
    {
        var course = await _context.Courses.FindAsync(id);

        if (course == null)
        {
            return NotFound();
        }

        course.Title = dto.Title;
        course.Description = dto.Description;
        course.ImageUrl = dto.ImageUrl;
        course.IsApproved = dto.IsApproved;
        course.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Courses/{id} - Teachers and Admins only
    [HttpDelete("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);

        if (course == null)
        {
            return NotFound();
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
