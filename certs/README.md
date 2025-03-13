# SSL Certificates for HTTPS

Secure server using self-signed certificate examples.

## Certificates

Guide how to make your own sertificates.

### Become a Certificate Authority

Windows console, open the Ubuntu WSL
```sh
wsl -d Ubuntu
```

Generate private key
```sh
openssl genrsa -des3 -out myCA.key 2048
```

Generate root certificate
```sh
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 825 -out myCA.pem
```

### Create CA-signed certificates

Use your own domain name
```sh
NAME=mydomain.example
```

Generate a private key
```sh
openssl genrsa -out $NAME.key 2048
```

Create a certificate-signing request
```sh
openssl req -new -key $NAME.key -out $NAME.csr
```

Create a config file for the extensions
```sh
>$NAME.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $NAME # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
DNS.2 = bar.$NAME # Optionally, add additional domains (I've added a subdomain here)
IP.1 = 127.0.0.1 # Optionally, add an IP address (if the connection which you have planned requires it)
IP.2 = localhost
EOF
```

Create the signed certificate
```sh
openssl x509 -req -in $NAME.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial \
-out $NAME.crt -days 825 -sha256 -extfile $NAME.ext
```

Extra steps for Windows (convert myCA.pem to myCA.pfx)
```sh
openssl pkcs12 -export -out myCA.pfx -inkey myCA.key -in myCA.pem
```
Import the `myCA.pfx` into the Trusted Certificate Authorities of Windows by opening (double-click) 
the `myCA.pfx` file, selecting "Local Machine" and Next, Next again, enter the password and then Next, 
and select "Place all certificates int he following store:" and click on Browse and choose 
"Trusted Root Certification Authorities" and Next, and then Finish.

Open the project in browser to test it:
- https://127.0.0.1/
- https://localhost/


## Create Self-signed Certificate (outdated)

This is how you can create a Self-signed Certificate for local node server.

Linux command or use Cygwin for windows:
```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```
This should leave you with two files, ***cert.pem*** (the certificate) and ***key.pem*** (the private key). 
Put these files in the same directory as your Node.js server file. This is all you need for a SSL connection.

## Node JS setup
This is an example from [nodejs.org](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/)
```js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(8000);
```