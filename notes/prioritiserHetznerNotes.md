## namecheap

Type: A Record
Host: student-prioritizer
Value: 49.12.76.128
TTL: Automatic

## Nginx
```nginx
server {
    server_name student-prioritizer.portfolio-projects.space;

    root /var/www/student-exam-prioritizer/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3019;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Hetzner bash

```bash
cd /var/www
git clone git@github.com:alkisax/student-exam-prioritizer.git
cd student-exam-prioritizer

cd backend
npm install
nano .env
npm run build
pm2 start npm --name student-prioritizer-backend -- start
pm2 save
curl http://localhost:3019/health

cd ../frontend
npm install
nano .env.production
npm run build

sudo nano /etc/nginx/sites-available/student-prioritizer
cat /etc/nginx/sites-available/student-prioritizer

sudo ln -s /etc/nginx/sites-available/student-prioritizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d student-prioritizer.portfolio-projects.space

pm2 list
sudo nginx -t
curl http://localhost:3019/health
```

## one line deploy
ssh root@49.12.76.128
```bash
cd /var/www/student-exam-prioritizer \
&& git pull origin main \
&& cd backend && npm install && npm run build \
&& cd ../frontend && npm install && npm run build \
&& cd ../backend && pm2 restart student-prioritizer-backend --update-env \
&& nginx -t && systemctl reload nginx \
&& sleep 3 \
&& curl -f https://student-prioritizer.portfolio-projects.space/api/ping \
&& echo "" \
&& echo "✓ student prioritizer deploy OK" \
&& echo ""
```

```
pm2 flush student-prioritizer-backend
pm2 logs student-prioritizer-backend --lines 50
```