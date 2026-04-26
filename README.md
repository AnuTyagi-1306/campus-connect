# 🎓 CampusConnect

**Premium control for campus ambassador programs** - A comprehensive platform to manage, track, and optimize campus ambassador campaigns with AI-powered insights and gamification.

![CampusConnect](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-06B6D4?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🎯 **Core Functionality**
- **Dual Dashboard System** - Separate interfaces for Organizations and Ambassadors
- **Task Management** - Create, assign, and track campaign tasks with deadlines
- **Real-time Leaderboard** - Gamified ranking system with college-level competition
- **Badge System** - Tier-based achievement badges (Common, Rare, Epic, Legendary)
- **Performance Analytics** - Comprehensive health metrics and insights

### 🤖 **AI-Powered Features**
- **AI Task Generator** - Personalized task creation based on campaign goals
- **AI Proof Verifier** - Automated submission evaluation with scoring
- **AI Performance Insights** - Data-driven recommendations for improvement
- **AI Weekly Reports** - Personalized performance summaries
- **AI Nudge Messages** - Intelligent re-engagement for inactive ambassadors

### 🎨 **Premium Design System**
- **Modern UI/UX** - Professional blue/emerald color scheme
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered interactions
- **Icon System** - Complete lucide-react icon integration
- **Dark Theme** - Eye-friendly dark interface throughout

### 📊 **Gamification Engine**
- **Points System** - Reward-based task completion
- **Streak Tracking** - Daily activity monitoring
- **Achievement Badges** - Visual progress indicators
- **Leaderboard Rankings** - Competitive performance display
- **Health Metrics** - Program performance analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/AnuTyagi-1306/campus-connect.git
cd campus-connect

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (for AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

```bash
# Development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Application Structure

```
campus-connect/
├── app/
│   ├── api/ai/           # AI API routes
│   ├── ambassador/       # Ambassador dashboard
│   ├── org/             # Organization dashboard
│   ├── globals.css      # Global styles & animations
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── layout/          # Navigation components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── storage.ts       # Local data management
│   └── notifications.ts # Notification system
└── README.md
```

## 🎯 Key Features Deep Dive

### Organization Dashboard
- **Program Health Gauge** - Visual performance metrics
- **Task Management** - Campaign creation and tracking
- **Ambassador Analytics** - Individual performance monitoring
- **Leaderboard Management** - View top performers
- **AI Nudge System** - Automated engagement messages

### Ambassador Dashboard
- **Personal Dashboard** - Individual stats and progress
- **Task Queue** - Available and completed tasks
- **Badge Collection** - Achievement showcase
- **AI Proof Verification** - Instant submission feedback
- **Weekly Reports** - AI-generated performance summaries

### AI Integration
All AI features are powered by OpenAI's GPT-4.1-mini model:
- **Structured JSON responses** for consistent data handling
- **Error handling** with graceful degradation
- **Rate limiting** and cost optimization
- **Context-aware prompts** for relevant outputs

## 🛠️ Technology Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4.1-mini
- **Storage**: LocalStorage (client-side)
- **Deployment**: Vercel ready

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
Compatible with Netlify, Railway, and any Next.js hosting platform.

## 🔧 Configuration

### Environment Variables
```env
OPENAI_API_KEY=sk-proj-...  # Required for AI features
```

### Customization
- **Color Scheme**: Modify CSS variables in `app/globals.css`
- **Badge Tiers**: Update configurations in `components/ui/BadgeCard.tsx`
- **AI Prompts**: Customize in `app/api/ai/route.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Demo Video

Watch the complete CampusConnect platform in action:

**[📹 CampusConnect Demo Video](https://drive.google.com/file/d/1WmtumYSZusFoxmpcNwSe44v0OnXVjpCP/view?usp=sharing)**

*This video demonstrates:*
- ✅ Complete user dashboard walkthrough
- ✅ AI-powered task generation and verification
- ✅ Gamification system with badges and leaderboards
- ✅ Real-time analytics and insights
- ✅ Professional UI/UX with smooth animations

*Perfect for understanding the full capabilities of the platform!*

---

## �🏆 Built With Passion

CampusConnect was designed to revolutionize campus ambassador program management with cutting-edge technology and user-centric design. Perfect for educational institutions, startups, and organizations looking to scale their campus outreach programs.

---

**Made with ❤️ by [Anu Tyagi](https://github.com/AnuTyagi-1306)**

[🚀 Deploy to Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) | [📖 Documentation](https://nextjs.org/docs) | [🐛 Report Issues](https://github.com/AnuTyagi-1306/campus-connect/issues)
