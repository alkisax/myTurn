using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceQueue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QueueId",
                table: "Services",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Services_QueueId",
                table: "Services",
                column: "QueueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Queues_QueueId",
                table: "Services",
                column: "QueueId",
                principalTable: "Queues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Queues_QueueId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_QueueId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "QueueId",
                table: "Services");
        }
    }
}
