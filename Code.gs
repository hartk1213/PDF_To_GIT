function onOpen() {
  SlidesApp.getUi()
    .createMenu("My Tools")
    .addItem("Export Tools", "showVersionSidebar")
    .addToUi();
}

function showVersionSidebar() {
  updateVersion();
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("Export Tools");
  SlidesApp.getUi().showSidebar(html);
}

function updateVersion() {
  const versionText = "VERSION " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMddyyyy");
  const descriptionTag = "version-box";
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  const slide = slides[0]; // Only first slide
  const shapes = slide.getShapes();

  let versionShape = null;

  // Check if version box already exists
  for (const shape of shapes) {
    if (shape.getPageElementType() === SlidesApp.PageElementType.SHAPE &&
        shape.getDescription() === descriptionTag) {
      versionShape = shape;
      break;
    }
  }

  const slideWidth = presentation.getPageWidth();
  const slideHeight = presentation.getPageHeight();
  const boxWidth = 1.65 * 72;  // 118.8 pts
  const boxHeight = 0.32 * 72; // 23.04 pts
  const margin = 0; // pts

  const x = slideWidth - boxWidth - margin;
  const y = slideHeight - boxHeight - margin;

  if (!versionShape) {
    versionShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, x, y, boxWidth, boxHeight);
    versionShape.setDescription(descriptionTag);
  } else {
    versionShape.setLeft(x);
    versionShape.setTop(y);
    versionShape.setWidth(boxWidth);
    versionShape.setHeight(boxHeight);
  }

  // Update text
  const textRange = versionShape.getText();
  textRange.setText(versionText);
  const textStyle = textRange.getTextStyle();
  textStyle.setFontFamily("Nunito");
  textStyle.setFontSize(11);
  textStyle.setForegroundColor("#FFFFFF"); // White

  // Set paragraph alignment to right
  const paragraphStyle = textRange.getParagraphStyle();
  paragraphStyle.setParagraphAlignment(SlidesApp.ParagraphAlignment.END); // Right align

  Logger.log("Version box updated and styled.");
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
    // ignore it , file could not exist yet
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
        Authorization: "token " + token,
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
