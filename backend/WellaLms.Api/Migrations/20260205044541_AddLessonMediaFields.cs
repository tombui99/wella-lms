using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WellaLms.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonMediaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalVideoUrl",
                table: "Lessons",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfUrl",
                table: "Lessons",
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Lessons",
                type: "longtext",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalVideoUrl",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "PdfUrl",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Lessons");
        }
    }
}
