<p align="center">
  <img width="100px" src="pending" align="center" alt="Sundo Logo" />
  <h2 align="center">Sundo</h2>
  <p align="center">An on-device AI support & companion app for Overseas Filipino Workers</p>
</p>
<p align="center">
    <a href="https://github.com/joaquingalang/sundo/graphs/contributors">
      <img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/joaquingalang/sundo?color=0088ff"/>
    </a>
    <a href="https://github.com/joaquingalang/sundo/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/joaquingalang/sundo?color=0088ff"/>
    </a>
    <a href="https://github.com/joaquingalang/sundo/pulls">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/joaquingalang/sundo?color=0088ff"/>
    </a>
</p>

<p align="center">
    <a href="https://github.com/joaquingalang/sundo/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/joaquingalang/sundo/issues/new?labels=enhancement">Request Feature</a>
    ·
    <a href="https://github.com/joaquingalang/sundo/discussions/categories/q-a">Ask Question</a>
</p>

## About the Project

**Sundo** is an on-device AI companion app for Overseas Filipino Workers (OFWs). It provides confidential, always-available legal and welfare consultations — entirely on the user's device, with no data sent to the cloud — powered by Google's Gemma 4 model.

## Problem and Objective

OFWs often face legal, contractual, and emergency situations abroad with little access to affordable professional guidance. Language barriers, time zones, and the cost of legal counsel make it hard to get timely help when it matters most.

Sundo puts an informed, empathetic consultant in every OFW's pocket — available offline, in Filipino or English, at any hour.

## Features

- **Contract Consultation** - Understand employment contract terms, identify red flags, and know your rights under POEA regulations and Philippine law.
- **Rights Advocacy** - Learn about OFW labor rights, OWWA and POEA benefits, DFA assistance, and PhilHealth entitlements.
- **Incident Response** - Get structured, calm guidance for documenting and responding to workplace incidents or emergencies abroad.
- **Multimodal Input** - Attach contract photos or voice-record your question — the AI understands text, images, and audio.
- **Language Toggle** - Switch between Filipino (Tagalog) and English at any point in the conversation.
- **On-Device AI** - All inference runs locally via Gemma 4 LiteRT — no internet required after the one-time model download, and no data ever leaves your phone.

## Tech Stack

- **Flutter** - Cross-platform mobile framework
- **Dart** - Programming language
- **flutter_gemma** - On-device Gemma 4 AI inference via LiteRT
- **flutter_markdown_plus** - Markdown rendering for AI responses
- **image_picker** - Image attachment support
- **record** - Audio recording support
- **flutter_dotenv** - Environment variable management
- **sizer** - Responsive UI scaling

## Installation Guide

1. Clone this repository.
2. Install dependencies:

```bash
flutter pub get
```

3. Create `assets/.env` and add your Hugging Face token:

```env
HF_TOKEN=your_huggingface_token_here
```

4. Run the app:

```bash
flutter run
```

5. On first launch, the app will download the Gemma 4 model (~1.5 GB). Subsequent launches load it instantly from local storage.

## Screenshots

**1. Dashboard**
<br>
*(pending)*
<br>

**2. Contract Consultation**
<br>
*(pending)*
<br>

**3. Rights Advocacy**
<br>
*(pending)*
<br>

**4. Incident Response**
<br>
*(pending)*
<br>

**5. Chat with Image Attachment**
<br>
*(pending)*
<br>

**6. Chat with Voice Input**
<br>
*(pending)*
<br>

## Team Members

- Joaquin Galang

## Future Improvements

**Expanded Consultation Modes**

Additional AI consultant personas for common OFW concerns such as remittance guidance, mental health check-ins, and pre-deployment checklists. Each mode would carry a tailored system instruction tuned to its domain.

**Offline Document Scanner**

An in-app document scanner that lets users photograph contracts or government forms and have the AI extract and explain key clauses without ever uploading the document.

**Community & Peer Support**

A moderated in-app forum where OFWs can share experiences, verified tips, and government advisory updates — bridging AI guidance with peer-to-peer knowledge.

**Government Agency Hotline Directory**

A built-in, always-up-to-date directory of OWWA, POEA, DFA, and Philippine embassy contacts sorted by country of deployment, accessible even without an active AI session.
