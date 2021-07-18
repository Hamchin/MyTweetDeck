# MyTweetDeck

https://mytweetdeck.herokuapp.com

## Development

#### ~/MyTweetDeck

```sh
$ pip install -r requirements.txt
$ cp .env.example .env
$ $EDITOR .env
$ python main.py
```

#### ~/MyTweetDeck/frontend

```sh
# Install
$ npm install

# Build
$ npm run build

# Watch
$ npm run watch
```

## Deployment

### Docker

```sh
# Create and Start
$ docker-compose up -d

# Stop
$ docker-compose stop

# Start
$ docker-compose start

# Remove
$ docker-compose down (--rmi all)
```

### Heroku

```sh
$ heroku git:remote --app app
$ heroku config:set TWITTER_CONSUMER_KEY="XXXXXXXXXX"
$ heroku config:set TWITTER_CONSUMER_SECRET="XXXXXXXXXX"
$ heroku config:set OAUTH_CALLBACK="https://XXXXXXXXXX.herokuapp.com"
$ heroku config:add TZ="Asia/Tokyo"
$ git push heroku master
```

### Amazon Linux 2 AMI

#### Local

```sh
# Login
$ ssh -i ~/.ssh/example.pem ec2-user@{ELASTIC_IP}
```

#### EC2

```sh
# Update
$ sudo yum update -y

# Install Docker
$ sudo amazon-linux-extras install docker
$ sudo service docker start
$ sudo usermod -a -G docker ec2-user

# Install Docker Compose
$ sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose

# Install Git
$ sudo yum install git

# Deploy
$ git clone https://github.com/${USER}/MyTweetDeck.git
$ cd ~/MyTweetDeck
$ cp .env.example .env
$ $EDITOR .env
$ docker-compose up -d
```
