#!/usr/bin/env node
// setup-network.js
// 네트워크 IP를 자동으로 감지하고 .env 파일을 생성하는 스크립트

import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 로컬 네트워크 IP 주소를 가져옵니다
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // 네트워크 인터페이스를 순회하면서 로컬 IP 찾기
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4이고, 내부 IP가 아니고, 192.168 또는 10.0으로 시작하는 IP
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') ||
            iface.address.startsWith('10.0.') ||
            iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }

  // 찾지 못하면 localhost 반환
  return 'localhost';
}

/**
 * .env 파일을 생성하거나 업데이트합니다
 */
function setupEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const localIP = getLocalIP();
  const backendPort = 3000;

  const envContent = `# Auto-generated .env file
# This file is automatically created by setup-network.js
# Run 'npm run setup' to regenerate this file

# 백엔드 API 주소 (로컬 네트워크 IP)
VITE_API_BASE=http://${localIP}:${backendPort}/api
VITE_FILE_BASE=http://${localIP}:${backendPort}/
`;

  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✅ 네트워크 설정 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 로컬 네트워크 IP: ${localIP}`);
  console.log(`🔗 프론트엔드 주소: http://${localIP}:5173`);
  console.log(`🔗 백엔드 API 주소: http://${localIP}:${backendPort}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📋 핸드폰에서 테스트하려면:');
  console.log(`   1. 핸드폰과 컴퓨터가 같은 WiFi에 연결되어 있는지 확인`);
  console.log(`   2. 백엔드 서버 실행: cd bool_backend && npm run start:dev`);
  console.log(`   3. 프론트엔드 서버 실행: npm run dev`);
  console.log(`   4. 핸드폰 브라우저에서 http://${localIP}:5173 접속`);
  console.log('');

  if (localIP === 'localhost') {
    console.log('⚠️  경고: 로컬 네트워크 IP를 찾을 수 없습니다.');
    console.log('   WiFi에 연결되어 있는지 확인해주세요.');
  }
}

// 스크립트 실행
setupEnvFile();
