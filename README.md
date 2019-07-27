# atmo-backend

## Project setup
1.Clone this repository by git or download zip from this site
Git:
```
git clone git@github.com:ShinKaiMa/atmo-backend.git
```

2.For yarn:
```
yarn install
```
For npm:
```
npm install
```

3.Build your RSA public & private key, then put those in ./key path.
You can generate your RSA key by following commands :
```
ssh-keygen -t rsa -b 4096 -m PEM -f atmo.key
# Don't add passphrase (just key in 'enter')
openssl rsa -in atmo.key -pubout -outform PEM -out atmo.key.pub
```

4.Build admin.json file in ./key, file content will like:
```
{
	"admins": [
		{
			"email": "example@example.com",
			"password": "YOUR_STRONG_PASSWORD_WITCH_LONGER_THAN_8_CHAR"
		},
		{
			"email": "example2@example.com",
			"password": "YOUR_STRONG_PASSWORD2_WITCH_LONGER_THAN_8_CHAR"
		}
	]
}
```

5.Set your mongodb connect URL in value 'database' in ./config.js 
```
'database': 'YOUR_MONGODB_URL',
```

6.Start server
```
npm start
```