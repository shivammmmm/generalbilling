# 🌿 AgroShop — Complete Installation & LAN Guide

---

## 📦 PART 1: Naye System pe Install Kaise Karein

### Kya Kya Chahiye (Pehle Download Karo):

| Software | Download Link | Size |
|----------|--------------|------|
| Node.js (LTS) | https://nodejs.org | ~30 MB |
| MongoDB Community | https://www.mongodb.com/try/download/community | ~500 MB |
| AgroShop Folder | USB / AnyDesk se copy | ~50 MB |

---

### 🔧 Installation Steps (Server Laptop)

#### Step 1 — Node.js Install Karo
1. `node-lts-installer.msi` chalao
2. **Next → Next → Next → Finish**
3. Restart karo

#### Step 2 — MongoDB Install Karo
1. `mongodb-installer.msi` chalao
2. Setup Type: **Complete** select karo
3. ✅ **"Install MongoDB as a Service"** — **ZAROOR check karo**
4. ✅ **"Install MongoDB Compass"** (optional, useful for viewing data)
5. **Next → Install → Finish**

#### Step 3 — AgroShop Folder Copy Karo
1. USB se `AgroShop-Management-System-main` folder copy karo
2. `C:\AgroShop\` mein paste karo (ya koi bhi folder)

#### Step 4 — Dependencies Install Karo (Sirf Ek Baar)
1. `C:\AgroShop\backend\` folder mein jao
2. Address bar mein type karo: `cmd` → Enter
3. Type karo: `npm install` → Enter → Wait karo

4. `C:\AgroShop\frontend\` folder mein jao
5. Address bar mein type karo: `cmd` → Enter
6. Type karo: `npm install` → Enter → Wait karo

#### Step 5 — Done!
- Ab `START-AGROSHOP.bat` double-click karo
- Browser khulega automatically
- License key enter karo → Software ready ✅

---

## 🌐 PART 2: 2 Laptop pe LAN Setup

### Setup Kaise Hai:

```
┌──────────────────────┐         WiFi Router          ┌────────────────────┐
│   LAPTOP 1 (SERVER)  │ ◄──── ya LAN Cable ────►    │  LAPTOP 2 (CLIENT) │
│                      │                              │                    │
│  MongoDB ✅           │                              │  Sirf Chrome ✅    │
│  Backend ✅           │                              │  Kuch install      │
│  Frontend ✅          │                              │  nahi karna!       │
│                      │                              │                    │
│  START-AGROSHOP.bat  │                              │  Browser mein URL  │
│  double-click karo   │                              │  type karo         │
└──────────────────────┘                              └────────────────────┘
```

### Kaise Chalao:

#### Laptop 1 (Server) pe:
1. `START-AGROSHOP.bat` double-click karo
2. Screen pe yeh dikhega:
   ```
   Doosre laptop (LAN) se: http://192.168.1.5:5173
   ```
3. Woh IP note karo

#### Laptop 2 (Client) pe:
1. Chrome kholo
2. Address bar mein type karo: `http://192.168.1.5:5173`
   (Laptop 1 ka IP yahan aayega)
3. License key enter karo → Done ✅

### ⚠️ Zaroor Dhyan Rakho:
- Dono laptop **ek hi WiFi ya LAN** se connected hone chahiye
- Laptop 1 **band nahi karna** jab tak kaam chal raha ho
- Windows Firewall alert aaye toh **"Allow"** click karo

---

## 💾 PART 3: Data Kahan Store Hota Hai?

### Location:
```
C:\data\db\
```

### Kya Yeh Safe Hai?

| Situation | Kya Hoga Data ka? |
|-----------|-------------------|
| PC restart hua | ✅ Data safe |
| Light gayi, PC off hua | ✅ Data safe (mostly) |
| Software update hua | ✅ Data safe |
| `C:\data\db\` folder delete kiya | ❌ Data gone! |
| Hard disk kharab | ❌ Data gone! |
| Virus | ❌ Risk hai |

### 🔑 Rules for Client:
1. **`C:\data\db\` folder kabhi delete mat karo**
2. **Weekly backup lo** (next section dekho)
3. **Antivirus install rakho**

---

## 🔄 PART 4: Backup Kaise Lein?

### Method 1 — Automatic Backup Script (Easy)
1. `BACKUP-DATABASE.bat` double-click karo
2. `BACKUPS` folder mein dated backup ban jayega
3. Woh folder USB mein copy karo

### Method 2 — Manual Backup (Simple)
1. AgroShop band karo
2. `C:\data\db\` folder copy karo
3. USB ya Google Drive pe paste karo

### Method 3 — Google Drive Auto Backup
1. Google Drive install karo on client PC
2. `C:\data\db\` ko Google Drive mein sync karo
3. Automatic cloud backup hota rahega ✅

### Backup Schedule Recommend:
- **Daily**: Agar daily invoices bante hain
- **Weekly**: Agar weekly use hai
- **Monthly**: Minimum

---

## 🔁 PART 5: Backup Restore Kaise Karein?

Agar kuch delete ho gaya ya new PC pe data laana hai:

1. AgroShop band karo
2. Purani `C:\data\db\` folder delete karo
3. Backup ki `C:\data\db\` copy karo
4. AgroShop start karo → Poora data wapas ✅

---

## 📋 Project Files Summary

```
AgroShop-Management-System-main\
├── START-AGROSHOP.bat       ← Double-click to START
├── STOP-AGROSHOP.bat        ← Double-click to STOP
├── BACKUP-DATABASE.bat      ← Double-click to BACKUP
├── OFFLINE-SETUP.md         ← Installation guide
├── BACKUPS\                 ← Backup files yahan save hongi
├── backend\
│   └── .env                 ← Auto set by START script
└── frontend\
    └── .env                 ← Auto set with LAN IP
```

---

## ❓ FAQ

**Q: Laptop 2 pe kuch install karna hai?**
A: Nahi! Sirf Chrome chahiye.

**Q: Internet chahiye?**
A: Nahi! Pure offline kaam karta hai.

**Q: Data cloud pe jata hai?**
A: Nahi! Sab kuch client ke PC pe.

**Q: Laptop 1 band ho to Laptop 2 kaam karega?**
A: Nahi — Laptop 1 server hai, woh on rehna chahiye.

**Q: License key expire hogi?**
A: Nahi — jab tak software mein key hai, kaam karta rahega.

---

*AgroShop v1.0 — Offline + LAN Edition*
