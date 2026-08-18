ssh root@49.12.76.128

# name cheap1

Type: A Record
Host: myturn
Value: 49.12.76.128
TTL: Automatic

# NGINX

```nginx
server {
    server_name myturn.portfolio-projects.space;

    root /var/www/myturn/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3020/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_buffering off;
        proxy_read_timeout 100s;
        proxy_cache off;

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

# appsettings.Production.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  },
  "ConnectionStrings": {
    "MyTurn": "Data Source=/var/www/myturn/data/MyTurn.db"
  },
  "AllowedHosts": "*",
  "JWT_SECRET": "JWT_SECRET_-----",
  "Frontend": {
    "TicketTrackingBaseUrl": "https://myturn.portfolio-projects.space/track"
  },
  "Email": {
    "SmtpHost": "smtp.zoho.eu",
    "SmtpPort": 587,
    "Username": "alkisax@zohomail.eu",
    "Password": "kalopass",
    "FromEmail": "alkisax@zohomail.eu"
  }
}
```

# bash

```bash
cd /var/www
mkdir myturn
cd myturn
git clone git@github.com:alkisax/myTurn.git .
cd /var/www/myturn/backend
cat backend.csproj
cat Program.cs

mkdir -p /var/www/myturn/data
nano appsettings.Production.json
cat appsettings.Production.json
chmod 600 appsettings.Production.json

cd /var/www/myturn/backend
# Αυτή η εντολή παίρνει το backend project και φτιάχνει το production-ready build. dotnet publish → κάνει compile και μαζεύει ό,τι χρειάζεται για να τρέξει η εφαρμογή. -c Release → χρησιμοποιεί Release configuration, όχι Development. -o out → βάζει το αποτέλεσμα στον φάκελο /out
dotnet publish -c Release -o out

cd /var/www/myturn/backend/out
dotnet backend.dll
# ανοίγω νεο ssh terminal και κάνω Ping
pm2 start "dotnet backend.dll" --name myturn-backend
pm2 save

nano /etc/nginx/sites-available/myturn.portfolio-projects.space
# Η εντολή φτιάχνει μια «συντόμευση» του config μέσα στο sites-enabled, ώστε το nginx να αρχίσει να το χρησιμοποιεί.
ln -s /etc/nginx/sites-available/myturn.portfolio-projects.space \
      /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
curl http://myturn.portfolio-projects.space/health

certbot --nginx -d myturn.portfolio-projects.space
nginx -t
curl https://myturn.portfolio-projects.space/api/ping

#front
cd /var/www/myturn/frontend
cat package.json
nano .env.production
# VITE_BACKEND_URL=https://myturn.portfolio-projects.space/api
cat .env.production
npm install
npm run build

```

# one line deploy command

ssh root@49.12.76.128

```bash
cd /var/www/myturn && git pull origin main && cd backend && pm2 stop myturn-backend && rm -rf out && dotnet publish -c Release -o out && pm2 restart myturn-backend && cd ../frontend && npm install && npm run build && sleep 3 && echo && curl https://myturn.portfolio-projects.space/api/health && echo
```

```bash
pm2 flush myturn-backend
pm2 logs myturn-backend --lines 30
```