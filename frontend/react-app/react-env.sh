#!/bin/bash

source ./.env

echo "export REACT_APP_FIREBASE_API_KEY=HELLO_WORLD" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_AUTH_DOMAIN=$authDomain" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_PROJECT_ID=$projectId" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_STORAGE_BUCKET=$storageBucket" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_APP_ID=$appId" >> /etc/profile.d/react-env.sh
echo "export REACT_APP_FIREBASE_MEASUREMENT_ID=$measurementId" >> /etc/profile.d/react-env.sh
