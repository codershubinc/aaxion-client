# Contributing to Aaxion Web

First off, thank you for considering contributing to Aaxion Drive! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## ⚖️ Legal & License

**Important:** This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.
By contributing to this repository, you agree that your contributions will be licensed under the same AGPLv3 terms.

## 🛠 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Bun** (Recommended for speed) or `npm`/`yarn`
- **Git**

### Installation

1. **Fork the repository**
   Click the "Fork" button at the top right of this page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aaxion-web.git
   cd aaxion-web
   ```

3. **Install dependencies**
   We recommend using Bun as it is faster and a bun.lock file is present.
   ```bash
   bun install
   # Or if you prefer npm:
   # npm install
   ```

4. **Environment Setup**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Note: Open `.env.local` and configure any necessary API endpoints (e.g., pointing to your local aaxion backend).

5. **Run the Development Server**
   ```bash
   bun dev
   # or
   # npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- **src/app**: Next.js App Router pages and layouts.
- **src/components**: Reusable UI components (Sidebar, FileExplorer, etc.).
- **src/services**: API integration logic (uploadService, fileService).
- **src/config**: Global constants and configuration.

## 🚀 Submission Guidelines

### Creating a Pull Request (PR)

1. **Create a Branch**: Always create a new branch for your work.
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. **Commit Messages**: Write clear, descriptive commit messages.
   - ✅ Good: `feat: add drag-and-drop upload support`
   - ❌ Bad: `fixed stuff`

3. **Lint & Test**: Ensure your code passes linting before pushing.
   ```bash
   bun run lint
   ```

4. **Push & Open PR**: Push your branch to your fork and submit a Pull Request to the `main` branch of this repository.

## 🎨 Coding Standards

- **TypeScript**: We use strict TypeScript. Please define interfaces for props and data structures.
- **Tailwind CSS**: Use utility classes for styling. Avoid `style={{ ... }}` unless necessary for dynamic values.
- **Formatter**: Prettier is configured. Please format your code before submitting.

## 🐞 Found a Bug?

If you find a bug in the source code, you can help us by submitting an issue to our GitHub Repository. Even better, you can submit a Pull Request with a fix.

---

Happy Coding! ⚡️
