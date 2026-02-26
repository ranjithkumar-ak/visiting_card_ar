# 🌐 AR Visiting Card – Dinesh S

A browser-based Augmented Reality business card built with **A-Frame** and **AR.js**. No mobile app required – works directly in Chrome / Safari on any smartphone.

Point your phone camera at the **Hiro marker** and watch a futuristic 3D business card float above it, complete with clickable contact buttons, an info panel, and a voice introduction.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **3D AR Card** | Floating card with neon borders, rotating rings, and corner brackets |
| **Smooth Animation** | Continuous up/down floating motion |
| **Dark-tech Theme** | Glassmorphism card with cyan/green neon accents |
| **8 Contact Buttons** | Call, WhatsApp, Email, Portfolio, GitHub, LinkedIn, LeetCode, Instagram |
| **Info Panel** | Expandable education & achievements section |
| **Voice Intro** | Text-to-speech: _"Hi, I'm Dinesh…"_ |
| **Tap Animations** | Visual feedback on button touches |
| **Mobile-first** | Optimized for phone screens, touch interactions |

---

## 📂 Project Structure

```
visiting_card_ar/
├── index.html      # Main AR experience (A-Frame + AR.js scene + overlay card)
├── style.css       # All styling (glassmorphism, neon accents, animations)
├── app.js          # Application logic (marker events, voice, toggles)
├── marker.html     # Printable Hiro marker page with instructions
└── README.md       # This file
```

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/ranjithkumar-ak/visiting_card_ar.git
cd visiting_card_ar
```

### 2. Serve locally (required for camera access)

Browsers require HTTPS or `localhost` for camera permissions. Use any local server:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (install serve globally first)
npx serve .

# VS Code: use the "Live Server" extension
```

### 3. Open on your phone

- Find your computer's local IP: `hostname -I` (Linux) or `ipconfig` (Windows)
- On your phone browser, navigate to: `https://YOUR_IP:8080`
- **Allow camera access** when prompted

> ⚠️ Some browsers require HTTPS for camera. Use [ngrok](https://ngrok.com/) for a quick tunnel:
> `ngrok http 8080` → use the generated HTTPS URL on your phone.

### 4. Point camera at the Hiro marker

- Open `marker.html` on your computer screen (or print it)
- Point your phone camera at the marker
- The 3D card + contact overlay will appear!

---

## 🏗️ Hosting on GitHub Pages

1. Push the code to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main** branch, root folder `/`
4. Click **Save**
5. Your AR card will be live at:
   `https://YOUR_USERNAME.github.io/visiting_card_ar/`

Share this URL (or a QR code pointing to it) on your physical business card!

---

## 📱 How to Generate a QR Code

Create a QR code that links to your hosted AR page so anyone can scan it:

1. Go to [qrcode-monkey.com](https://www.qrcode-monkey.com/) or [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter your GitHub Pages URL: `https://YOUR_USERNAME.github.io/visiting_card_ar/`
3. Download the QR code as PNG/SVG
4. Print it on your physical visiting card

**Flow for the recipient:**
```
Scan QR code → Opens AR page in browser → Point camera at Hiro marker → See 3D AR card
```

---

## 🎯 About the Hiro Marker

This project uses the **Hiro marker**, a built-in preset in AR.js. It's the standard marker for AR.js demos and is widely recognized.

- View/print the marker: open `marker.html` in a browser
- The marker must be **flat**, **well-lit**, and **clearly visible** to the camera
- Recommended print size: **6 cm × 6 cm** or larger
- Works best on white paper with high contrast

### Using a Custom Marker (Advanced)

To use your own image/logo as the AR marker:

1. Go to the [AR.js Marker Training tool](https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html)
2. Upload your image (high contrast, simple design works best)
3. Download the `.patt` pattern file
4. Replace `preset="hiro"` in `index.html` with:
   ```html
   <a-marker type="pattern" url="your-marker.patt">
   ```

---

## 🧪 Testing Tips

| Platform | Browser | Status |
|----------|---------|--------|
| Android  | Chrome  | ✅ Fully supported |
| iOS      | Safari  | ✅ Fully supported |
| iOS      | Chrome  | ⚠️ May need Safari for camera |
| Desktop  | Chrome  | ✅ Works with webcam |

### Troubleshooting

- **Camera not working?** → Ensure HTTPS or localhost, and grant camera permissions
- **Marker not detected?** → Improve lighting, hold phone steady, ensure marker is flat
- **Card not appearing?** → Check browser console for errors (F12)
- **Voice not working?** → Some mobile browsers block auto-play audio; tap the button

---

## 🛠️ Tech Stack

- **[A-Frame](https://aframe.io/)** v1.3.0 – WebVR/WebXR 3D framework
- **[AR.js](https://ar-js-org.github.io/AR.js-Docs/)** v3.4.5 – Marker-based AR for the web
- **HTML5 / CSS3 / JavaScript** – UI overlay and interactions
- **Web Speech API** – Voice intro feature
- **Font Awesome** – Icons
- **Google Fonts** – Orbitron & Rajdhani typefaces

---

## 📋 Contact Information

| Channel | Link |
|---------|------|
| 📞 Phone | [+91 80561 29665](tel:+918056129665) |
| 💬 WhatsApp | [wa.me/918056129665](https://wa.me/918056129665) |
| 📧 Email | [personalaccdinesh@gmail.com](mailto:personalaccdinesh@gmail.com) |
| 🌐 Portfolio | [dinesh-ai.tech](https://www.dinesh-ai.tech) |
| 💻 GitHub | [itzdineshx](https://github.com/itzdineshx) |
| 🔗 LinkedIn | [dinesh-xo](https://linkedin.com/in/dinesh-xo) |
| 🧠 LeetCode | [dinesh-xo](https://leetcode.com/u/dinesh-xo/) |
| 📸 Instagram | [dkverse7](https://instagram.com/dkverse7) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).