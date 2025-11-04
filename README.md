# AI Image Editor

A modern web application that combines **image editing** and **image generation** using Google's latest AI models. Built with Next.js, shadcn/ui, and powered by Replicate API.

## ✨ Features

- **🎨 Image Editing** - Transform existing images using Google's Nano-Banana model
- **🖼️ Image Generation** - Create new images from text descriptions using Gemini 2.5 Flash
- **📁 Multi-Image Support** - Upload and edit multiple images simultaneously
- **🎯 Drag & Drop Interface** - Intuitive file upload with visual previews
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **⚡ Real-time Progress** - Live updates during AI processing
- **💾 Easy Export** - Download results or copy URLs instantly

## 🚀 AI Models

- **Google Nano-Banana** - Advanced image editing and style transfer
- **Google Gemini 2.5 Flash** - High-quality image generation from text

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **AI Integration**: Replicate API
- **File Handling**: react-dropzone
- **Notifications**: Sonner
- **TypeScript**: Full type safety

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install shadcn components**
   ```bash
   npx shadcn@latest add button card input textarea progress sonner tabs badge separator select label
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Replicate API token:
   ```env
   REPLICATE_API_TOKEN=your_token_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

### Image Editing
1. Switch to the **"Edit Images"** tab
2. Upload one or multiple images via drag & drop
3. Enter your editing prompt (e.g., "make it look like a painting")
4. Click **"Edit Images"** to process

### Image Generation
1. Switch to the **"Generate Image"** tab  
2. Enter your generation prompt (e.g., "a tiger fighting with a lion in a city, realistic photo 8k")
3. Click **"Generate Image"** to create

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── image-edit/     # Nano-banana editing endpoint
│   │   └── image-generate/ # Gemini generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # shadcn components
│   └── ImageEditor.tsx     # Main editor component
└── lib/
    └── utils.ts
```

## 🔑 API Endpoints

- **POST /api/image-edit** - Edit images using nano-banana
- **POST /api/image-generate** - Generate images using Gemini 2.5 Flash

## 🌟 Key Features

- **Tab-based Interface** - Seamlessly switch between editing and generation
- **Multi-image Preview** - See all uploaded images in a responsive grid
- **Smart Progress Tracking** - Visual feedback during AI processing  
- **Result Gallery** - View, download, and manage all your creations
- **Error Handling** - Comprehensive error management with user-friendly messages

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

# ai-image-editor
# Image-editor-Ai
