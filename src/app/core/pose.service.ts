import { Injectable, signal } from '@angular/core';
import * as poseDetection from '@tensorflow-models/pose-detection';

@Injectable({ providedIn: 'root' })
export class PoseService {
  detector!: poseDetection.PoseDetector;

  poses = signal<any[]>([]);
  currentExercise = signal<string>('squat');

  stats = signal({
    squat: { reps: 0, isDown: false },
    pushup: { reps: 0, isDown: false },
    jumpingjack: { reps: 0, isOpen: false },
  });

  async init() {
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: 'SinglePose.Lightning' }
    );
  }

  async detect(video: HTMLVideoElement) {
    const poses = await this.detector.estimatePoses(video);
    this.poses.set(poses);

    if (poses.length) {
      this.processExercise(poses[0].keypoints);
    }
  }

  processExercise(keypoints: any[]) {
    const type = this.currentExercise();

    if (type === 'squat') this.detectSquat(keypoints);
    if (type === 'pushup') this.detectPushup(keypoints);
    if (type === 'jumpingjack') this.detectJumpingJack(keypoints);
  }

  // 🏋️ Squat
  detectSquat(kp: any[]) {
    const hip = kp.find(k => k.name === 'left_hip');
    const knee = kp.find(k => k.name === 'left_knee');
    const ankle = kp.find(k => k.name === 'left_ankle');

    if (!hip || !knee || !ankle) return;

    const angle = this.getAngle(hip, knee, ankle);
    const s = this.stats();

    if (angle < 90 && !s.squat.isDown) {
      s.squat.isDown = true;
    }

    if (angle > 160 && s.squat.isDown) {
      s.squat.reps++;
      s.squat.isDown = false;
    }

    this.stats.set({ ...s });
  }

  // 💪 Push-up
  detectPushup(kp: any[]) {
    const shoulder = kp.find(k => k.name === 'left_shoulder');
    const elbow = kp.find(k => k.name === 'left_elbow');
    const wrist = kp.find(k => k.name === 'left_wrist');

    if (!shoulder || !elbow || !wrist) return;

    const angle = this.getAngle(shoulder, elbow, wrist);
    const s = this.stats();

    if (angle < 90 && !s.pushup.isDown) {
      s.pushup.isDown = true;
    }

    if (angle > 160 && s.pushup.isDown) {
      s.pushup.reps++;
      s.pushup.isDown = false;
    }

    this.stats.set({ ...s });
  }

  // 🤸 Jumping Jack
  detectJumpingJack(kp: any[]) {
    const leftWrist = kp.find(k => k.name === 'left_wrist');
    const rightWrist = kp.find(k => k.name === 'right_wrist');

    if (!leftWrist || !rightWrist) return;

    const s = this.stats();
    const handsUp = leftWrist.y < 200 && rightWrist.y < 200;

    if (handsUp && !s.jumpingjack.isOpen) {
      s.jumpingjack.isOpen = true;
    }

    if (!handsUp && s.jumpingjack.isOpen) {
      s.jumpingjack.reps++;
      s.jumpingjack.isOpen = false;
    }

    this.stats.set({ ...s });
  }

  getAngle(a: any, b: any, c: any) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };

    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
    const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);

    return (Math.acos(dot / (magAB * magCB)) * 180) / Math.PI;
  }
}