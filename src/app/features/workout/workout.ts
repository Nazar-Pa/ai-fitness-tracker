import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { PoseService } from '../../core/pose.service';
import { HistoryService } from '../../core/history.service';
import { TitleCasePipe } from '@angular/common';
import { calculateAngle } from '../../utils/calculations.helper';

@Component({
  selector: 'app-workout',
  imports: [TitleCasePipe],
  templateUrl: './workout.html',
  styleUrl: './workout.scss',
})
export class Workout {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  squatCount = signal(0);
  isDown = signal(false);
  poseService = inject(PoseService);
  historyService = inject(HistoryService);
  currentExercise = this.poseService.currentExercise;
  cameraIsOn = false;
  formFeedback = signal('Start doing push-ups...');

  constructor() {
    this.init();
  }

  stats = this.poseService.stats;

  setExercise(type: string) {
    this.poseService.currentExercise.set(type);
  }

  saveSession() {
    const stats = this.poseService.stats();

    this.historyService.save({
      date: new Date().toISOString(),
      squat: stats.squat.reps,
      pushup: stats.pushup.reps,
      jumpingjack: stats.jumpingjack.reps,
    });
  }

  async init() {
    await this.poseService.init();
    await this.startCamera();
    this.loop();
  }

  async startCamera() {
    const video = this.videoRef.nativeElement;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    video.srcObject = stream;

    return new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });
  }

  loop() {
    const detectFrame = async () => {
      const video = this.videoRef.nativeElement;
      if (video.videoWidth === 0) return;
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      await this.poseService.detect(video);

      const poses = this.poseService.poses();
      // console.log('POSES:', poses);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;

        this.drawSkeleton(ctx, keypoints);
        this.detectSquat(keypoints);
        if (this.poseService.currentExercise() === 'squat') {
          this.analyzeSquatForm(keypoints);
        }
      }

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }

  analyzeSquatForm(keypoints: any[]) {
    const hip = keypoints.find(k => k.name === 'left_hip');
    const knee = keypoints.find(k => k.name === 'left_knee');
    const ankle = keypoints.find(k => k.name === 'left_ankle');
    const shoulder = keypoints.find(k => k.name === 'left_shoulder');

    if (!hip || !knee || !ankle || !shoulder) return;

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const backAngle = calculateAngle(shoulder, hip, knee);

    let feedback = '';

    if (kneeAngle > 160) {
      feedback = '⬇️ Go lower';
    } else if (kneeAngle < 70) {
      feedback = '⚠️ Too low, control movement';
    } else if (backAngle < 40) {
      feedback = '🧍 Keep your back straight';
    } else {
      feedback = '✅ Good form!';
    }

    this.formFeedback.set(feedback);
  }

  drawSkeleton(ctx: CanvasRenderingContext2D, keypoints: any[]) {
    ctx.fillStyle = 'red';

    keypoints.forEach((kp) => {
      if (kp.score > 0.4) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  detectSquat(keypoints: any[]) {
    const hip = keypoints.find(k => k.name === 'left_hip');
    const knee = keypoints.find(k => k.name === 'left_knee');
    const ankle = keypoints.find(k => k.name === 'left_ankle');

    if (!hip || !knee || !ankle) return;

    const angle = this.getAngle(hip, knee, ankle);

    if (angle < 90 && !this.isDown()) {
      this.isDown.set(true);
    }

    if (angle > 160 && this.isDown()) {
      this.squatCount.update(v => v + 1);
      this.isDown.set(false);
    }
  }

  getAngle(a: any, b: any, c: any) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

    const angle = Math.acos(dot / (magAB * magCB));
    return (angle * 180) / Math.PI;
  }
}
