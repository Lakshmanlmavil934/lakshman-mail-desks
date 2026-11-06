# Lakshman Mail Desk

A responsive email-template website that can be hosted free with GitHub Pages.

## Files
- `index.html` — page structure
- `style.css` — design and responsive layout
- `script.js` — templates, editing, preview, local drafts and Gmail compose

## Publish on GitHub Pages
1. Create a new public GitHub repository (for example `lakshman-mail-desk`).
2. Upload these three files to the repository's main/root folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select **main** and **/(root)**, then Save.
6. Wait for GitHub to publish the site. Open the Pages URL shown there.

## Gmail compose
The Compose buttons open Gmail's compose page in a new browser tab with the subject and message filled in. If a recipient is saved in a template, it is prefilled too. Otherwise, enter the recipient in Gmail.

## Notes
- Edit a template using the pencil icon. To, CC, BCC, subject and message are editable.
- Date placeholders (`{{DATE}}`) are replaced using Today, Tomorrow or Custom date.
- Template edits and saved-draft history are stored in the current browser using localStorage. They do not sync between devices.
- The website does not send email by itself. You review and send it from Gmail.
- Use HTTPS (GitHub Pages provides it) and sign in to the intended Google account in Chrome.
