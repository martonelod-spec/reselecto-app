# ReSelecto – Szállítás Kezelő Alkalmazás

Expo-alapú React Native mobilalkalmazás szállítások nyilvántartásához.
Adatforrás: Google Sheets API v4 | Képtárolás: Dropbox API v2

---

## Tartalomjegyzék

1. [Előfeltételek](#1-előfeltételek)
2. [Projekt letöltése](#2-projekt-letöltése)
3. [Google Sheets beállítása](#3-google-sheets-beállítása)
4. [Dropbox beállítása](#4-dropbox-beállítása)
5. [Konfigurációs fájlok kitöltése](#5-konfigurációs-fájlok-kitöltése)
6. [Telepítés és indítás](#6-telepítés-és-indítás)
7. [Alkalmazás használata](#7-alkalmazás-használata)
8. [Táblázat felépítése](#8-táblázat-felépítése)
9. [Hibakeresés](#9-hibakeresés)

---

## 1. Előfeltételek

A következő szoftverek szükségesek:

| Szoftver | Verzió | Telepítési link |
|----------|--------|-----------------|
| Node.js | ≥ 18.x | https://nodejs.org |
| npm | ≥ 9.x | Node.js-sel együtt |
| Expo CLI | legújabb | `npm install -g expo-cli` |
| Expo Go app | legújabb | App Store / Google Play |

---

## 2. Projekt letöltése

```bash
# Klónozd a repository-t
git clone <repo-url> reselecto-app
cd reselecto-app

# Másold a .env.example fájlt
cp .env.example .env
```

---

## 3. Google Sheets beállítása

### 3.1 – Google Cloud projekt létrehozása

1. Nyisd meg: https://console.cloud.google.com/
2. Kattints a **"Projekt létrehozása"** gombra
3. Adj nevet a projektnek (pl. `reselecto-sheets`)
4. Kattints **"Létrehozás"**

### 3.2 – Google Sheets API engedélyezése

1. Bal menüben: **API-k és szolgáltatások > Könyvtár**
2. Keresd: `Google Sheets API`
3. Kattints **"Engedélyezés"**

### 3.3 – Service Account létrehozása

1. Bal menüben: **API-k és szolgáltatások > Hitelesítő adatok**
2. Kattints **"Hitelesítő adatok létrehozása" > "Szolgáltatásfiók"**
3. Névnek add meg: `reselecto-service`
4. Kattints **"Létrehozás és folytatás"**
5. Szerepkör: **"Szerkesztő"** (vagy csak Sheets editor)
6. Kattints **"Kész"**

### 3.4 – JSON kulcs letöltése

1. Kattints az imént létrehozott service accountra
2. **"Kulcsok"** fül > **"Kulcs hozzáadása" > "Új kulcs létrehozása"**
3. Formátum: **JSON** > **"Létrehozás"**
4. A letöltött JSON fájlban találod:
   - `client_email` → ez lesz a `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → ez lesz a `GOOGLE_PRIVATE_KEY`

### 3.5 – Táblázat megosztása a service accounttal

1. Nyisd meg a Google Sheets táblázatot
2. Kattints **"Megosztás"** gombra
3. Add meg a service account email-jét (pl. `reselecto-service@...iam.gserviceaccount.com`)
4. Jogosultság: **"Szerkesztő"**
5. Kattints **"Küldés"**

### 3.6 – Spreadsheet ID megkeresése

A táblázat URL-jéből:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ITT/edit
```
A `SPREADSHEET_ID_ITT` részre van szükséged.

---

## 4. Dropbox beállítása

### 4.1 – Dropbox App létrehozása

1. Nyisd meg: https://www.dropbox.com/developers/apps
2. Kattints **"Create app"**
3. Válaszd: **"Scoped access"**
4. Hozzáférés: **"Full Dropbox"** (hogy a `/Szallitas/` mappát elérd)
5. Adj nevet az appnak (pl. `reselecto-delivery`)
6. Kattints **"Create app"**

### 4.2 – Szükséges engedélyek (Permissions)

Az **"Permissions"** fülön kapcsold be:
- `files.content.read` – képek olvasásához
- `files.content.write` – képek feltöltéséhez
- `files.metadata.read` – mappa tartalmának listázásához

Kattints **"Submit"** a mentéshez.

### 4.3 – Access Token generálása

1. Az **"Settings"** fülön görgess le az **"OAuth 2"** részhez
2. Az **"Access token expiration"** legyen: `No expiration`
3. Kattints **"Generate"** a **"Generated access token"** mezőnél
4. Másold ki a tokent → ez lesz a `DROPBOX_ACCESS_TOKEN`

### 4.4 – Dropbox mappa létrehozása

A Dropboxban hozd létre a `/Szallitas/` mappát (ha még nincs).
Minden szállítás automatikusan kap egy almappát az ID-ja alapján.

---

## 5. Konfigurációs fájlok kitöltése

### 5.1 – .env fájl

Szerkeszd a `.env` fájlt:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=reselecto-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEET_NAME=Szallitasok

DROPBOX_ACCESS_TOKEN=sl.B2AqJz...ABC123
DROPBOX_ROOT_FOLDER=/Szallitas
```

> **Fontos:** A `GOOGLE_PRIVATE_KEY` értékében a sortöréseket `\n`-nel kell jelölni (ne valódi sortörés legyen).

### 5.2 – Közvetlen konfiguráció (alternatíva)

Ha nem használsz .env fájlt, szerkeszd közvetlenül:

**`app/config/google.js`** – cseréld ki a placeholder értékeket:
```js
serviceAccountEmail: 'your-service-account@your-project.iam.gserviceaccount.com',
privateKey: '-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----',
spreadsheetId: 'YOUR_SPREADSHEET_ID',
```

**`app/config/dropbox.js`** – cseréld ki:
```js
accessToken: 'YOUR_DROPBOX_TOKEN',
```

---

## 6. Telepítés és indítás

```bash
# 1. Függőségek telepítése
npm install

# 2. Alkalmazás indítása
npx expo start

# 3. Megnyitás telefonon
# – Olvasd be a QR kódot az Expo Go alkalmazással
# – Vagy nyomj 'a' Android emulátorhoz, 'i' iOS szimulátorhoz
```

### Fejlesztői eszközök

```bash
# Android eszközön/emulátoron
npx expo start --android

# iOS szimulátorban (csak Mac)
npx expo start --ios

# Web böngészőben (korlátozott funkcionalitás)
npx expo start --web
```

---

## 7. Alkalmazás használata

### Bejelentkezés

Az alkalmazás indításakor válassz szerepkört:
- **Sofőr** – kiszállítások kezelése, fotók, aláírás
- **Iroda** – teljes hozzáférés, összes szállítás

Nincs jelszó, csak szerepkör-választás szükséges.

### Főképernyő

- **Keresés:** Írj be szöveget a keresőbe (ID, dokumentum, helység, cím, rendszám)
- **Szűrők:** Szűrj megye, helység vagy státusz szerint
- **Frissítés:** Húzd le a listát a frissítéshez (pull-to-refresh)
- **Kártya:** Koppints egy szállításra a részletek megtekintéséhez

### Részlet képernyő

| Funkció | Leírás |
|---------|--------|
| Státusz változtatás | Koppints a státusz jelvényre, válaszd ki az újat |
| Hívás | A "Hívás" gombbal hívhatod az ügyfelet |
| SMS | Ha a hívás nem fogadott, SMS-t küldhetsz |
| Fotó | Koppints "Fotó készítése" → kamera nyílik |
| Aláírás | Koppints "Aláírás" → aláírás pad nyílik |
| Megjegyzés | Szerkeszd az "Alte informatii" mezőt, majd "Mentés" |

### Képgaléria

- A képek automatikusan betöltődnek a Dropboxból
- Koppints egy képre a teljes képernyős nézethez
- Balra/jobbra navigálhatsz a képek között

---

## 8. Táblázat felépítése

A Google Sheets táblázat neve: **Szallitasok**
Az első sor fejléc (A1:K1), az adatok a 2. sortól kezdődnek.

| Oszlop | Neve | Leírás |
|--------|------|--------|
| A | ID / 1.oszlop | Egyedi azonosító, Dropbox mappa neve |
| B | Status | Szállítás státusza |
| C | Data | Dátum |
| D | NrVehicul | Rendszám |
| E | Document | Szállítólevél szám |
| F | Zona | Zóna |
| G | Tr | Tr |
| H | Alte informatii | Egyéb info (telefonszám is ide kerüljön!) |
| I | Localitate | Helység |
| J | Judet | Megye |
| K | Adresa | Cím |

### Telefonszám formátum az "Alte informatii" mezőben

Az alkalmazás automatikusan felismeri ezeket a formátumokat:
```
+40 742 123 456
0742123456
0742-123-456
+36 30 123 4567
```

---

## 9. Hibakeresés

### "Nem sikerült betölteni az adatokat"

1. Ellenőrizd az internetkapcsolatot
2. Ellenőrizd a `GOOGLE_SPREADSHEET_ID` értéket
3. Győződj meg róla, hogy a service account rendelkezik szerkesztési joggal
4. Ellenőrizd, hogy a `GOOGLE_PRIVATE_KEY` helyesen van-e formázva (\\n sortörések)

### "Nem sikerült betölteni a képeket"

1. Ellenőrizd a `DROPBOX_ACCESS_TOKEN` érvényességét
2. Győződj meg róla, hogy a `/Szallitas/` mappa létezik a Dropboxban
3. Ellenőrizd a Dropbox app engedélyeket (files.content.read szükséges)

### Kamera nem működik

1. Ellenőrizd, hogy az eszközön engedélyezted-e a kamera-hozzáférést
2. Android: Beállítások > Alkalmazások > Expo Go > Engedélyek > Kamera

### Aláírás nem töltődik fel

1. Ellenőrizd a Dropbox token `files.content.write` engedélyét
2. Nézd meg, hogy az ID mező ki van-e töltve a táblázatban

---

## Projekt struktúra

```
reselecto-app/
├── App.js                    # Navigáció, belépési pont
├── app.json                  # Expo konfiguráció
├── package.json              # Függőségek
├── babel.config.js           # Babel konfiguráció
├── .env.example              # Környezeti változók mintája
├── .gitignore
├── README.md
└── app/
    ├── screens/
    │   ├── LoginScreen.js        # Szerepkör-választó
    │   ├── HomeScreen.js         # Főképernyő + kereső
    │   ├── DeliveryDetailScreen.js  # Szállítás részletei
    │   ├── CameraScreen.js       # Kamera + feltöltés
    │   └── SignatureScreen.js    # Aláírás pad
    ├── components/
    │   ├── DeliveryCard.js       # Szállítás kártya
    │   ├── StatusBadge.js        # Színes státusz jelvény
    │   ├── ImageGallery.js       # Képgaléria + teljes képernyő
    │   ├── StatusPicker.js       # Státusz választó bottom sheet
    │   ├── SearchBar.js          # Keresőmező
    │   └── FilterBar.js          # Szűrők (megye/helység/státusz)
    ├── config/
    │   ├── google.js             # Google API konfiguráció
    │   ├── dropbox.js            # Dropbox konfiguráció
    │   ├── sms.js                # SMS sablon
    │   └── statusConfig.js       # Státusz színek és opciók
    ├── services/
    │   ├── googleSheets.js       # Google Sheets API hívások
    │   └── dropboxService.js     # Dropbox API hívások
    └── hooks/
        ├── useDeliveries.js      # Szállítások betöltése + cache
        └── useDropboxImages.js   # Dropbox képek kezelése
```

---

## Státuszok

| Státusz | Szín |
|---------|------|
| Teljesítve | Zöld (#1A7A40) |
| Visszaszállítani | Világoszöld (#5DCAA5) |
| Begyűjtésre vár | Piros (#C0001A) |
| Javítva | Sárga (#F0C040) |
| Nem javítható | Sötétszürke (#444441) |
| Reselecto | Világosszürke (#D3D1C7) |
| Reselecto Service | Kék (#185FA5) |

---

*ReSelecto Szállítás Kezelő – Belső használatra*
