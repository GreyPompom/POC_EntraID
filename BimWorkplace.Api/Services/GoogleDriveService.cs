using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;

namespace BimWorkplace.Api.Services;

public class GoogleDriveService
{
    private readonly DriveService _driveService;
    private readonly string? _defaultFolderId;

    public GoogleDriveService(IConfiguration configuration)
    {
        var section = configuration.GetSection("GoogleDrive");
        var keyPath = section["ServiceAccountKeyPath"]
            ?? throw new InvalidOperationException("GoogleDrive:ServiceAccountKeyPath not configured");

        _defaultFolderId = section["FolderId"];
        var appName = section["ApplicationName"] ?? "BimWorkplaceDrive";

        var scopedCredential = CredentialFactory
            .FromFile<ServiceAccountCredential>(keyPath)
            .ToGoogleCredential()
            .CreateScoped(DriveService.Scope.DriveReadonly);

        _driveService = new DriveService(new BaseClientService.Initializer
        {
            HttpClientInitializer = scopedCredential,
            ApplicationName = appName
        });
    }

    public async Task<IReadOnlyList<Google.Apis.Drive.v3.Data.File>> ListFilesAsync(string? folderId = null)
    {
        var request = _driveService.Files.List();
        request.Fields = "files(id, name, mimeType, size, modifiedTime)";
        request.PageSize = 50;

        var effectiveFolderId = folderId ?? _defaultFolderId;

        if (!string.IsNullOrWhiteSpace(effectiveFolderId))
        {
            request.Q = $"'{effectiveFolderId}' in parents and trashed = false";
        }
        else
        {
            request.Q = "trashed = false";
        }

        var result = await request.ExecuteAsync();
        return (IReadOnlyList<Google.Apis.Drive.v3.Data.File>)result.Files;
    }

    public async Task<Stream> DownloadFileAsync(string fileId)
    {
        var request = _driveService.Files.Get(fileId);
        var stream = new MemoryStream();
        await request.DownloadAsync(stream);
        stream.Position = 0;
        return stream;
    }
}
