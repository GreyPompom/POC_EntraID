using BimWorkplace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace BimWorkplace.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoogleDriveController : ControllerBase
{
    private readonly GoogleDriveService _driveService;

    public GoogleDriveController(GoogleDriveService driveService)
    {
        _driveService = driveService;
    }

    [HttpGet("files")]
    public async Task<IActionResult> ListFiles([FromQuery] string? folderId = null)
    {
        var files = await _driveService.ListFilesAsync(folderId);

        var result = files.Select(f => new
        {
            id = f.Id,
            name = f.Name,
            mimeType = f.MimeType,
            size = f.Size,
            modifiedTime = f.ModifiedTimeDateTimeOffset?.UtcDateTime
        });

        return Ok(result);
    }

    [HttpGet("files/{id}/download")]
    public async Task<IActionResult> DownloadFile(string id)
    {
        var stream = await _driveService.DownloadFileAsync(id);

        // se quiser pode tentar descobrir o content-type real; pra POC, genérico funciona
        return File(stream, "application/octet-stream", fileDownloadName: id);
    }
}

//GET /api/GoogleDrive/files lista arquivos
//GET /api/GoogleDrive/files/{id}/ download baixa um arquivo.

                                           