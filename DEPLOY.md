# Running the POS in the shop

One computer in the shop runs the POS. Tills, tablets and phones on the shop Wi-Fi use it
through a web browser. No internet is needed, nothing is installed on the tills, and all the
data stays in the shop.

## In plain words

- **The shop PC is the brain.** It stays on during opening hours and keeps the record of every
  item, price, sale and customer.
- **Tills and phones are windows into it.** They open a web address like
  `http://192.168.1.20:3000` and sign in. They must be on the shop Wi-Fi.
- **It backs itself up every night** at 23:30 into the `backups` folder. Copy that folder to a
  USB stick once a week, so a broken PC can't take the shop's history with it.
- **Golden rules:** keep the shop PC on while the shop is open, never delete the `TasneemPOS`
  folder, and copy the backups off the PC every week.

---

## First setup (once, about 15 minutes)

### 1. Install two free programs on the shop PC

1. **Node.js** runs the POS. Go to <https://nodejs.org>, download the **LTS** version, and click
   *Next* through the installer, keeping the defaults.
2. **Git** downloads the POS. Go to <https://git-scm.com/download/win>, download it, and click
   *Next* through the installer, keeping the defaults.

### 2. Open PowerShell as administrator

Click **Start**, type **PowerShell**, right click **Windows PowerShell**, and choose
**Run as administrator**. Click *Yes* when Windows asks.

### 3. Download the POS

Paste these two lines (press Enter after each):

```powershell
cd C:\
git clone https://github.com/ayalakkis/Tasneem-POS-system.git TasneemPOS
```

The repository is private, so a **Connect to GitHub** window opens the first time:

1. Click **Sign in with your browser**.
2. Sign in to GitHub as the account that owns the repository.
3. Click **Authorize Git Credential Manager**, then go back to PowerShell. The download finishes
   in a few seconds and creates `C:\TasneemPOS`.

Windows remembers this, so updates won't ask again.

> **Shared shop PC?** That sign-in gives the PC access to the *whole* GitHub account. If staff
> also use this Windows account, use a limited key instead: on GitHub go to **Settings >
> Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**,
> choose **Only select repositories > Tasneem-POS-system**, and give **Contents: Read-only**.
> When Git asks for a password, paste that token. It can only read this one repository.
>
> **No Git at all?** On the repository page click **Code > Download ZIP** and extract it to
> `C:\TasneemPOS`. The setup works the same, but each update means downloading a new ZIP
> instead of running the update script.

> Keep the POS in `C:\TasneemPOS`, not on the Desktop or in a OneDrive folder: cloud sync can
> lock the database file while the shop is using it.

### 4. Run the setup

```powershell
cd C:\TasneemPOS
powershell -ExecutionPolicy Bypass -File scripts\setup-shop.ps1
```

It walks through 7 steps and asks you for:

- the **admin username** (press Enter to keep `admin`), and
- a **password** of at least 8 characters, typed twice. Nothing appears on screen while you
  type; that's normal.

When it finishes, it prints the address of the POS, for example:

```
Open the POS on the tills and phones (same Wi-Fi) at:
    http://192.168.1.20:3000
```

### 5. Open it on each till and phone

On each device on the shop Wi-Fi, open the browser, type that address, and save it as a
bookmark (or "Add to home screen" on a phone). Sign in with the admin account, then create a
cashier account for each employee from **Users**.

### 6. Keep the address from changing (recommended)

The router gives the shop PC its address and may change it after a restart, which would break
the bookmarks. In the router's settings, look for **DHCP reservation** (sometimes "static
lease" or "address reservation") and reserve the current address for the shop PC.

---

## Every day

Turn on the shop PC. The POS starts by itself within a minute; there's nothing to open on the PC.
Cashiers open their bookmark and sign in.

## Every week: copy the backups

Copy the folder `C:\TasneemPOS\backups` to a USB stick (or a OneDrive folder). It holds the
last 30 nightly copies, named by date, for example `pos-2026-10-25-2330.db`.

---

## Updating to a new version

When there's a new version on GitHub, open PowerShell **as administrator** and run:

```powershell
cd C:\TasneemPOS
powershell -ExecutionPolicy Bypass -File scripts\update-shop.ps1
```

It backs up the database first, downloads the update, rebuilds, and restarts the POS. Do it
outside opening hours; the POS is offline for a few minutes.

## Restoring a backup

If the data needs to go back to an earlier day, open PowerShell **as administrator**:

```powershell
cd C:\TasneemPOS
Stop-ScheduledTask "Tasneem POS"
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Copy-Item prisma\shop.db prisma\shop-before-restore.db
Copy-Item backups\pos-2026-10-25-2330.db prisma\shop.db
Start-ScheduledTask "Tasneem POS"
```

Replace the file name with the backup you want. The current database is kept as
`shop-before-restore.db`, just in case.

## Moving to a new PC

1. On the old PC, copy `C:\TasneemPOS\prisma\shop.db` and `C:\TasneemPOS\.env` to a USB stick.
2. On the new PC, do steps 1 to 3 of the first setup.
3. Copy `shop.db` into `C:\TasneemPOS\prisma\` and `.env` into `C:\TasneemPOS\`.
4. Run the setup (step 4). It keeps your `.env`, and since the admin already exists it doesn't
   change any password.

---

## If something goes wrong

**A till can't open the POS**
- Is the shop PC on, and is the till on the **same Wi-Fi**?
- Does it work on the shop PC itself at <http://localhost:3000>? If yes, the problem is the
  network: in Windows on the shop PC, open **Settings > Network & internet**, click the Wi-Fi
  (or Ethernet) network, and make sure it's set to **Private network**. The setup only opens
  the POS on private networks.
- Did the address change? Run `ipconfig` on the shop PC and compare with the bookmark.

**The POS doesn't open even on the shop PC**
- Look at the end of `C:\TasneemPOS\logs\server.log` for the error.
- Restart it: in PowerShell as administrator, run `Start-ScheduledTask "Tasneem POS"`, or simply
  restart the PC.

**Forgot the admin password**
- Another admin can reset it from **Users**. If there's no other admin, contact whoever
  maintains the system: it needs a small database command.

---

## For the developer

- `npm run start:shop` serves the production build on `0.0.0.0:3000`.
- `npm run backup` writes `backups/pos-<date>.db` with SQLite `VACUUM INTO` and keeps 30.
- `.env` on the shop PC: `DATABASE_URL="file:./shop.db"` (in `prisma/`), a random
  `SESSION_SECRET`, and `COOKIE_SECURE="false"` because the shop network is plain http. An
  https deployment must set `COOKIE_SECURE="true"`.
- Scheduled tasks (run as SYSTEM): **Tasneem POS** at startup runs `scripts\start-shop.cmd`;
  **Tasneem POS Backup** daily at 23:30. Logs go to `logs\`.
- `scripts/setup-shop.ps1 -SkipSystem` runs everything except the firewall rule and scheduled
  tasks, for testing.
