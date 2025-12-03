using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;



namespace BimWorkplace.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            var name = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value;
            return Ok(new { Message = "BIMWorkplace API (secured)", User = name });
        }
    }
}

                          