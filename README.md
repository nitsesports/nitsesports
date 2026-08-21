# 🎮 NITS Esports — Official Esports Club of NIT Silchar

Welcome to the official repository of **NIT Silchar Esports Club** 🏆  
This is the home for our website, events, and gaming community.  
Join us to compete, contribute, and create something epic together!  

---

## 🤝 How to Contribute

We ❤️ open-source contributions!  
Whether you’re a beginner or a seasoned dev, your input helps us improve the platform.

<details>
<summary><b>🧩 1️⃣ Fork & Clone the Repository</b></summary>

Click the **Fork** button (top-right corner) to create your copy of this repo, then clone it:

```bash
git clone https://github.com/<your-username>/nitsesports.git
cd nitsesports
```
</details>

---

<details>
<summary><b>⚙️ 2️⃣ Create a New Branch</b></summary>

Create a separate branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/login-page
```
</details>

---

<details>
<summary><b>📦 3️⃣ Install Dependencies</b></summary>

Using **npm**:

```bash
npm install
```

Or, if you use **Bun**:

```bash
bun install
```
</details>

---

<details>
<summary><b>🔐 4️⃣ Configure Environment Variables</b></summary>

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```bash
VITE_SUPABASE_URL = https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
VITE_ADMIN_EMAIL = your-email@example.com
VITE_GOOGLE_CLIENT_ID = your-google-client-id
```

> ⚠️ **Note:** `.env` is already in `.gitignore`.  
> Never commit real API keys or private data to GitHub.
</details>

---

<details>
<summary><b>💻 5️⃣ Run the Development Server</b></summary>

Start the project locally:

```bash
npm run dev
```

Then visit 👉 [http://localhost:5173](http://localhost:5173)

You should see the **NITS Esports Homepage** 🎉
</details>

---

<details>
<summary><b>🛠️ 6️⃣ Make Your Changes</b></summary>

You can now add features, fix bugs, or enhance the UI.  
Follow these conventions for consistency:

- **camelCase** → variables  
- **PascalCase** → React components  
- **kebab-case** → file & folder names
</details>

---

<details>
<summary><b>🧹 7️⃣ Test & Lint</b></summary>

Before committing, run ESLint to ensure code quality:

```bash
npm run lint
```
</details>

---

<details>
<summary><b>🚀 8️⃣ Commit, Push & Open a PR</b></summary>

Once ready:

```bash
git add .
git commit -m "Add: short description of your change"
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub:

1. Click **Compare & pull request**  
2. Explain your changes  
3. Mention related issues (if any)  

🎉 Wait for review and merge!
</details>

---

## 🗂️ Project Structure

```graphql
nitsesports/
├── public/               # Static assets (favicon, images, videos)
├── src/                  # React app source code
├── types/                # TypeScript type definitions
├── .env.example          # Example environment variables
├── .gitignore            # Git ignored files
├── vite.config.js        # Vite configuration
├── tailwind.config.cjs   # Tailwind setup
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript config
├── vercel.json           # Deployment config (Vercel)
└── README.md             # You are here 🚀
```

---

## 🚀 Deployment

The production build is automatically deployed via **Vercel**.

To test locally in production mode:

```bash
npm run build
npm run preview
```

Then open [http://localhost:5173](http://localhost:5173)

---

## 📧 Contact

For queries, suggestions, or collaborations:

📩 **Email:**  esports.nits@gmail.com  
🌐 **Website:** [nitsesports.in](https://nitsesports.in)  
🧑‍💻 **GitHub Org:** [github.com/nitsesports](https://github.com/nitsesports)

---

## 📜 License

This project is licensed under the **MIT License**.  
You’re free to use, modify, and distribute it with proper attribution.

---

## 🏆 Credits

Built with ❤️ by  
**NIT Silchar Esports Dev Team**  
and the awesome community of contributors and organizers behind **NITS Esports**.

---

✨ *Level up the code. Level up the game.*  
🎯 *Together, we build the future of NIT Silchar Esports.*
