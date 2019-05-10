# atmo-backend

## Project setup
1.
for yarn:
```
yarn install
```
for npm:
```
npm install
```

2.
build your RSA public & private key in ./key
```
ssh-keygen -t rsa -b 4096 -m PEM -f atmo.key
# Don't add passphrase
openssl rsa -in atmo.key -pubout -outform PEM -out atmo.key.pub
```

3.
set your mongodb connect URL in value 'database' in ./config.js 
```
'database': 'YOUR_MONGODB_URL',
```

4.
start server
```
npm server.js
```
or starting server by nodemon
```
nodemon
```