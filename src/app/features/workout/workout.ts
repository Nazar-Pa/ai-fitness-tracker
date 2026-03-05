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

  // squatCount = signal(0);
  isDown = signal(false);
  poseService = inject(PoseService);
  historyService = inject(HistoryService);
  currentExercise = this.poseService.currentExercise;
  cameraIsOn = false;
  formFeedback = signal('Start doing squats...');
  frameCount = 0;
  badJoints = signal<Set<string>>(new Set());

  skeletonConnections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],

    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],

    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],

    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
  ];

  idealSquatPose = [
  { x: 300, y: 200 }, // shoulder
  { x: 320, y: 300 }, // hip
  { x: 350, y: 400 }, // knee
  { x: 360, y: 500 }  // ankle
];

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
      this.frameCount++;
      const video = this.videoRef.nativeElement;
      if (video.videoWidth === 0) {
        requestAnimationFrame(detectFrame);
        return;
      }
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (this.frameCount % 3 === 0) {
        await this.poseService.detect(video);
      }

      const poses = this.poseService.poses();
      // console.log('POSES:', poses);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;

        this.drawGhostPose(ctx);
        this.drawSkeleton(ctx, keypoints);

        const exercise = this.poseService.currentExercise();

        if (exercise === 'squat') {
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

    const bad = new Set<string>();

    let feedback = '';

    if (kneeAngle > 160) {
      feedback = '⬇️ Go lower';
      bad.add('left_knee');
    }
    else if (kneeAngle < 70) {
      feedback = '⚠️ Too low, control movement';
      bad.add('left_knee');
    }
    else if (backAngle < 40) {
      feedback = '🧍 Keep your back straight';
      bad.add('left_hip');
      bad.add('left_shoulder');
    }
    else {
      feedback = '✅ Good form!';
    }

    this.badJoints.set(bad);
    this.formFeedback.set(feedback);
  }

  drawGhostPose(ctx: CanvasRenderingContext2D) {

  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(this.idealSquatPose[0].x, this.idealSquatPose[0].y);
  ctx.lineTo(this.idealSquatPose[1].x, this.idealSquatPose[1].y);
  ctx.lineTo(this.idealSquatPose[2].x, this.idealSquatPose[2].y);
  ctx.lineTo(this.idealSquatPose[3].x, this.idealSquatPose[3].y);
  ctx.stroke();
}

drawSkeleton(ctx: CanvasRenderingContext2D, keypoints: any[]) {
  const bad = this.badJoints();

  const keypointMap = new Map(
    keypoints.map(k => [k.name, k])
  );

  ctx.lineWidth = 4;

  this.skeletonConnections.forEach(([p1, p2]) => {
    const kp1 = keypointMap.get(p1);
    const kp2 = keypointMap.get(p2);

    if (kp1?.score > 0.4 && kp2?.score > 0.4) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);

      ctx.strokeStyle =
        bad.has(p1) || bad.has(p2) ? '#ef4444' : '#22c55e';

      ctx.stroke();
    }
  });

  keypoints.forEach(kp => {
    if (kp.score > 0.4) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);

      ctx.fillStyle = bad.has(kp.name)
        ? '#ef4444'
        : '#22c55e';

      ctx.fill();
    }
  });
}

}
