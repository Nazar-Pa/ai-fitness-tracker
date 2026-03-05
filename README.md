# 🧠 AI Pose Fitness Trainer

An **AI-powered fitness trainer in the browser** that detects body poses in real time using **TensorFlow.js MoveNet** and counts exercise repetitions while giving **AI-based form correction feedback**.

Built with **Angular 20+, TensorFlow.js, Pose Detection API, and Chart.js**.

---

# 🚀 Features

## 🧍 Real-Time Pose Detection
- Uses **TensorFlow.js MoveNet model**
- Detects human body joints from webcam video
- Runs **fully in the browser**
- No backend required

---

## 🏋️ Exercise Detection

Supported exercises:

- Squats
- Push-ups
- Jumping Jacks

The system automatically detects motion patterns and counts repetitions.
<img width="4433" height="328" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/c5d84690-13d4-4665-ae23-638eb896df53" />

---

## 🧠 AI Form Correction

The application analyzes joint angles and posture to provide **real-time coaching feedback**.

Example feedback:
⬇️ Go lower
🧍 Keep your back straight
⚠️ Too low
✅ Good form


Form analysis is based on **joint angle calculations** using pose keypoints.

---

## 📊 Progress Dashboard

Workout history is stored locally and visualized with **Chart.js**.

The dashboard shows:

- Workout progress over time
- Exercise repetition history
- Interactive charts with tooltips

---

## 🎨 Modern UI

- Angular Signals for reactive state
- Responsive layout
- SCSS styling
- Dashboard-style charts

---

# 🏗 Tech Stack

| Technology | Purpose |
|------------|--------|
| Angular 20+ | Frontend framework |
| Angular Signals | State management |
| TensorFlow.js | Machine learning in browser |
| MoveNet | Fast pose detection |
| Pose Detection API | Human pose estimation |
| Chart.js | Workout progress charts |
| SCSS | Styling |
| HTML5 Video API | Webcam input |

---

# 📂 Project Structure
src/
├── app/
│ ├── workout/
│ │ ├── workout.component.ts
│ │ ├── workout.component.html
│ │ └── workout.component.scss
│ │
│ ├── dashboard/
│ │ ├── dashboard.component.ts
│ │ └── dashboard.component.html
│ │
│ ├── services/
│ │ └── workout-history.service.ts
│ │
│ └── utils/
│ └── pose-utils.ts
│
├── assets/
└── environments/


---

# ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Nazar-Pa/ai-pose-fitness.git
cd ai-pose-fitness

npm install

ng serve
