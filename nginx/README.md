# Configure Nginx 

1 - Install nginx from apt in ec2 server using sudo apt install nginx -y
  - make sure nginx is active, use - sudo systemctl status nginx
  - if its not active then make it active - sudo systemctl start nginx, sudo systemctl enable nginx

2 - Now will have a directory named etc -
        /etc/nginx/
        ├── nginx.conf
        ├── sites-available/
        └── sites-enabled/
    -this is main files and directories we have
    -nginx.conf is the global nginx configuration for our server, when we type sudo nginx -t, system reads this file
    -sites-available - 'default' is the default file in there, we can set our project as a nginx server here, just add
     our project name instead default eg:- sudo nano /etc/nginx/sites-available/venicara
    -sites-enable - its a directory where show the enabled sites means enabled projects like our project- link it
     to sites-enable eg:- sudo ln -s /etc/nginx/sites-available/venicara /etc/nginx/sites-enabled/

# The real Nginx configuration for this project

1 - get into our project file in sites-available - sudo nano /etc/nginx/sites-available/venicara
2 - start configure

Now We want to craete server Blocks to Configure our incoming requests

Server Block example :-
server {

}

now we need to give a port which the incoming request coming, example 80 if http or 443 if https

so we have to handle both http and https seperatly - so we have to create two server blocks

server block 1 - its for http, so we set --listen 80-- for reach http requests in this server
then we set --server_name venicara.shop--, since it has a domine name we use it, else we use public ip of our server here
Now we are redirecting the incoming request to a https server - we use --return 301 https://venicara.shop$request_uri--

so we have to create https server now

server block 2- we set --listen 443 ssl http2--, here we get https requests , 'ssl'- it will enable ssl certification for this socket. and we explicitly set http2 to use http second version(optional)

now set --server_name venicara.shop--

then start ssl certificate configuration

--ssl_certificate /etc/letsencrypt/live/venicara.shop/fullchain.pem--
This points to the SSL certificate file, which contains my domain's public certificate plus the intermediate certificates needed to establish trust from browsers.

--ssl_certificate_key /etc/letsencrypt/live/venicara.shop/privkey.pem--
This specifies the private key file that matches your SSL certificate. It is kept secret and used to decrypt incoming encrypted traffic.

--include /etc/letsencrypt/options-ssl-nginx.conf--
This includes recommended SSL configuration options from Let's Encrypt, such as secure TLS protocols and cipher suites, improving security without cluttering our config.

ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
This specifies Diffie-Hellman parameters file used for key exchange to provide forward secrecy, making encrypted connections more secure.

now we have to add location blocks in this server block 2- 
in location block we will add which location the coming req should go

location /public/
