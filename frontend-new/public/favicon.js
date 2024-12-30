// // 파비콘 PNG 생성을 위한 스크립트
// const fs = require('fs');
// const { createCanvas } = require('canvas');
//
// const canvas = createCanvas(32, 32);
// const ctx = canvas.getContext('2d');
//
// // 방패 그리기
// ctx.fillStyle = '#6DB33F';
// ctx.beginPath();
// ctx.moveTo(16, 2);
// ctx.lineTo(4, 7);
// ctx.lineTo(4, 14);
// ctx.quadraticCurveTo(4, 20.732, 16, 29);
// ctx.quadraticCurveTo(28, 20.732, 28, 14);
// ctx.lineTo(28, 7);
// ctx.closePath();
// ctx.fill();
//
// // 자물쇠 그리기
// ctx.strokeStyle = 'white';
// ctx.lineWidth = 2;
// ctx.beginPath();
// ctx.moveTo(12, 14);
// ctx.lineTo(12, 12);
// ctx.quadraticCurveTo(12, 9.79086, 16, 8);
// ctx.quadraticCurveTo(20, 9.79086, 20, 12);
// ctx.lineTo(20, 14);
// ctx.stroke();
//
// // 자물쇠 몸체
// ctx.fillStyle = 'white';
// ctx.fillRect(11, 14, 10, 8);
//
// // S 로고
// ctx.fillStyle = '#6DB33F';
// ctx.beginPath();
// ctx.arc(16, 17.5, 1.5, 0, Math.PI * 2);
// ctx.fill();
//
// // PNG로 저장
// const buffer = canvas.toBuffer('image/png');
// fs.writeFileSync('public/favicon.ico', buffer);