pipeline {
  agent {
    kubernetes {
      label 'jenkins-slave'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    name: jenkins-slave
spec:
  containers:
  - name: kubectl
    image: lachlanevenson/k8s-kubectl
    command: ['cat']
    tty: true
  - name: elasticsearch
    image: docker.elastic.co/elasticsearch/elasticsearch:6.7.0
    readinessProbe:
      httpGet:
        path: /
        port: 9200
      initialDelaySeconds: 30
      periodSeconds: 3
    securityContext:
      fsGroup: 1000
    ports:
    - containerPort: 9200
    env:
    - name: discovery.type
      value: single-node
  - name: docker
    image: docker
    command: ['cat']
    tty: true
    volumeMounts:
    - name: dockersock
      mountPath: /var/run/docker.sock
  - name: node
    image: node:8
    command: ['cat']
    tty: true
  volumes:
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock
"""
    }
  }
  environment {
      GOOGLE_APPLICATION_CREDENTIALS=credentials('google-serviceaccount')
      JENKINS_SERVICEACCOUNT=credentials('jenkins-serviceaccount')
      APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS='joseph@okharedia.com'
      IMAGE='ogatechnology/statements'
      KUBERNETES_FILE=''
      CURRENT_TAG = """${sh (script: 'date +%Y-%m-%d_%H-%M_$BUILD_NUMBER', returnStdout: true).trim()}"""
  }
  stages {
    stage('Checkout') {
        steps {
            git branch: 'master', credentialsId: 'github', url: 'https://github.com/ogatechnology/Statements.git'
        }
    }
    stage('Npm build') {
      steps {
        container('node') {
          sh """
            npm -version
            ls -lah
            cd microservice
            npm install
          """
        }
      }
    }
    stage('Npm test') {
        steps {
            container('node') {
                sh """
                  echo Using google serviceaccount $GOOGLE_APPLICATION_CREDENTIALS
                  echo Using email address $APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS
                  cd microservice
                  npm test
                """
            }
        }
    }
    stage('Docker build & push') {
        steps {
            container('docker') {
                withDockerRegistry([ credentialsId: "docker", url: "" ]) {
                    sh """
                      echo imageTag: ${IMAGE}:${CURRENT_TAG}
                      cd ${WORKSPACE}/microservice
                      docker build -t ${IMAGE}:latest .
                      docker tag ${IMAGE}:latest ${IMAGE}:${CURRENT_TAG}
                      docker push ${IMAGE}:${CURRENT_TAG}
                      docker push ${IMAGE}:latest
                    """
                }
            }
        }
    }
    stage('Tag & prepare deployment') {
        steps {
            sh """
              CREDENTIALS=`cat $GOOGLE_APPLICATION_CREDENTIALS`
              cd kubernetes-config
              sed -i -r 's/( *image: *).*/\\1$CURRENT_TAG/g' $KUBERNETES_FILE
              sed -i /topsecret/$CREDENTIALS/g
              cat $KUBERNETES_FILE
            """
        }
    }
    stage('Deploy') {
        steps {
            container('kubectl') {
                sh """
                  kubectl version
                  kubectl config view
                  kubectl config set-cluster mycluster --server=https://kubernetes
                  kubectl config set-credentials myuser --token $JENKINS_SERVICEACCOUNT
                  kubectl config set-context mycontext --user=myuser --cluster=mycluster
                  kubectl config use-context mycontext
                  kubectl config view
                  alias kubectl="kubectl --insecure-skip-tls-verify"
                  cd kubernetes-config
                  kubectl apply -f $KUBERNETES_FILE
                  kubectl wait --for
                """
            }
        }
    }
  }
}