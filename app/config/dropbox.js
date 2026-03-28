// ============================================================
// Dropbox API konfiguráció
// ============================================================
// Töltsd ki a Dropbox hozzáférési tokennel.
// A tokent a Dropbox App Console-ban generálhatod:
// https://www.dropbox.com/developers/apps
// ============================================================

export const DROPBOX_CONFIG = {
  // Dropbox hozzáférési token (hosszú lejáratú)
  accessToken: process.env.DROPBOX_ACCESS_TOKEN || 'YOUR_DROPBOX_ACCESS_TOKEN_HERE',

  // Gyökérmappa a Dropboxban
  rootFolder: '/Szallitas',

  // API alap URL
  apiUrl: 'https://api.dropboxapi.com/2',

  // Tartalom API URL (fájl feltöltéshez)
  contentUrl: 'https://content.dropboxapi.com/2',
};
