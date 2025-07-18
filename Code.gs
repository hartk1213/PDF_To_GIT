function onOpen() {
  SlidesApp.getUi()
    .createMenu("My Tools")
    .addItem("Export Tools", "showVersionSidebar")
    .addToUi();
}

function showVersionSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("Export Tools");
  SlidesApp.getUi().showSidebar(html);
}

function getPdfDownloadUrl() {
  const presentationId = SlidesApp.getActivePresentation().getId();
  return `https://docs.google.com/presentation/d/${presentationId}/export/pdf`;
}

function pushPdfToGitHub() {
  const props = PropertiesService.getUserProperties();
  const githubToken = props.getProperty("GITHUB_TOKEN");
  const githubRepo = props.getProperty("GITHUB_REPO");
  const githubPath = props.getProperty("GITHUB_PATH");

  if (!githubToken || !githubRepo || !githubPath) {
    return { success: false, message: "GitHub token, repository, or path not set. Please fill in the sidebar." };
  }

  const githubBranch = "main";
  const presentation = SlidesApp.getActivePresentation();
  const pdfBlob = DriveApp.getFileById(presentation.getId()).getAs("application/pdf");
  const base64PDF = Utilities.base64Encode(pdfBlob.getBytes());

  const getUrl = `https://api.github.com/repos/${githubRepo}/contents/${githubPath}?ref=${githubBranch}`;
  let sha = null;

  try {
    const getResp = UrlFetchApp.fetch(getUrl, {
      method: "get",
      headers: {
        Authorization: "Bearer " + githubToken,
        Accept: "application/vnd.github.v3+json"
      },
      muteHttpExceptions: true
    });

    const data = JSON.parse(getResp.getContentText());
    if (data && data.sha) sha = data.sha;
  } catch (e) {
    // silently ignore - file may not exist yet
  }

  const payload = {
    message: `Update ${githubPath}`,
    content: base64PDF,
    branch: githubBranch
  };
  if (sha) payload.sha = sha;

  const putResp = UrlFetchApp.fetch(`https://api.github.com/repos/${githubRepo}/contents/${githubPath}`, {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      Authorization: "Bearer " + githubToken,
      Accept: "application/vnd.github.v3+json"
    },
    muteHttpExceptions: true
  });

  const code = putResp.getResponseCode();
  if (code === 201 || code === 200) {
    return { success: true, message: "PDF exported and pushed to GitHub!" };
  } else {
    return {
      success: false,
      message: `GitHub responded with ${code}: ${putResp.getContentText()}`
    };
  }
}



function saveAllSettings(token, repo, path) {
  const props = PropertiesService.getUserProperties();
  props.setProperty("GITHUB_TOKEN", token);
  props.setProperty("GITHUB_REPO", repo);
  props.setProperty("GITHUB_PATH", path);
  return true;
}

function getGitHubSettings() {
  const props = PropertiesService.getUserProperties();
  return {
    token: props.getProperty("GITHUB_TOKEN"),
    repo: props.getProperty("GITHUB_REPO"),
    path: props.getProperty("GITHUB_PATH")
  };
}
function testGitHubToken(token) {
  try {
    const response = UrlFetchApp.fetch("https://api.github.com/user", {
      method: "get",
      muteHttpExceptions: true,
      headers: {
        Authorization: "token " + token, // ✅ use "token" not "Bearer" for classic PATs
        Accept: "application/vnd.github.v3+json"
      }
    });

    const code = response.getResponseCode();
    if (code === 200) {
      const user = JSON.parse(response.getContentText());
      return { success: true, login: user.login };
    } else {
      return {
        success: false,
        message: `GitHub responded with ${code}: ${response.getContentText()}`
      };
    }
  } catch (e) {
    return { success: false, message: `Error: ${e.message}` };
  }
}
