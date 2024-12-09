
# SEproject Deployment

This repository contains the deployment configuration for the **OwlBot** project, focusing on the backend setup and deployment on an AWS EC2 instance.

---

## Project Overview

The **OwlBot** project is a chatbot designed to provide information about FAU's faculty, research interests, ratings, and contact details, along with useful AI-related links and tech news. This repository ensures the deployment of the backend in a production environment.

---

## Features

- **Backend**: Deployed on AWS EC2 using Django.
- **Frontend**: Hosted on AWS Amplify for serving the user interface.
- **Nginx**: Configured as a reverse proxy for handling HTTPS and serving static files.
- **SSL**: Secured with Let's Encrypt certificates.
- **Static Files**: Properly managed using Django's `collectstatic`.

---

## Prerequisites

1. **AWS EC2 Instance**:
   - Ubuntu 20.04 or later.
   - Public IP address for the server.
2. **AWS Amplify**:
   - Deployed frontend repository.
3. **Domain Name**:
   - Purchased domain pointing to the EC2 instance.
4. **SSL Certificate**:
   - Generated using Let's Encrypt.

---

## Deployment Steps

### 1. Clone the Repository

```bash
sudo apt update

sudo apt install python3-pip python3-venv nginx certbot python3-certbot-nginx

git clone https://github.com/vishalarvinvinayaga/SEproject_Deployment.git

python3 -m venv venv

pip install -r requirement.txt

python manage.py migrate

python manage.py collectstatic

cd SEproject_Deployment/OwlBot_BackEnd/

source eecs_env/bin/activate

python manage.py runserver 0.0.0.0:8000

