#!/bin/bash

npm run build
cd build
npm ci --omit="dev"
cd ..
pm2 start ecosystem.config.cjs --env production
pm2 restart obex-customlamp
