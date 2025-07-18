# PDF to GitHub Tool for Google Slides

This is a simple Google Slides Add-on that allows you to export the current presentation as a PDF and automatically upload it to a GitHub repository.

No publishing or add-on installation required — just copy and paste the scripts into your own Slides project!

---

## Features

- Export the current Google Slides file as a PDF
- Push the PDF to a GitHub repository and path of your choice
- Securely store your GitHub token using Google Apps Script user properties
- Easy sidebar UI with settings and token help modal

---

## 🛠 Installation Instructions

### 1. Open a Google Slides File

Go to [Google Slides](https://slides.google.com) and open or create a presentation.

---

### 2. Open the Script Editor

From the Slides menu:  
**Extensions → Apps Script**

---

### 3. Add the Script Files

#### 🔹 Replace `Code.gs`
1. In the script editor, delete any existing code in `Code.gs`
2. Copy and paste the contents of `Code.gs` from this repo

#### 🔹 Add `Sidebar.html`
1. In Apps Script, click the `+` button → choose **HTML**
2. Name it `Sidebar`
3. Paste the contents of `Sidebar.html` from this repo

> Repeat for any other `.html` files (e.g., `Styles.html`, `Scripts.html`, `TokenHelp.html`) if they are separated.

---

### 4. Save and Reload

Click **File > Save**, then close the Apps Script tab.  
Back in Slides, refresh the tab.

---

### 5. Use the Tool

Once refreshed, go to:

> **Extensions > PDF to GitHub Tool > Export Tools**

The sidebar should open. From there you can:
- Enter your GitHub token, repo, and file path
- Test the token
- Push the current slide doc as a PDF to your GitHub repo

---

## How to Get a GitHub Token

1. Go to [GitHub Developer Settings](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name and expiration (optional)
4. Select scopes:
   - ✅ `repo` (for private repos)
   - ✅ `public_repo` (for public repos)
5. Click **Generate Token**
6. Copy and paste the token into the settings sidebar

You can also click the **"How do I get this?"** link in the tool for help.

---

## Permissions

This tool stores your GitHub token securely in your own Google account via `PropertiesService.getUserProperties()`. Tokens are **never shared** or visible to others.

---
