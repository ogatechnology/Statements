pipeline {
  agent {
    kubernetes {
      label 'jenkins-slave'
      defaultContainer 'jnlp'
      yamlFile 'k8s-jenkins-agent.yaml'
    }
  }
  options {
      buildDiscarder(logRotator(numToKeepStr: '3'))
  }
  environment {
      APP_NAME='statements'
      GOOGLE_APPLICATION_CREDENTIALS=credentials('google-serviceaccount')
      JENKINS_SERVICEACCOUNT=credentials('jenkins-serviceaccount')
      APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS='joseph@okharedia.com'
      IMAGE="ogatechnology/$APP_NAME"
      KUBERNETES_FILE='k8s-statements.yaml'
      CURRENT_TAG=sh(script: 'date +%Y-%m-%d_%H-%M_$BUILD_NUMBER', returnStdout: true).trim()
      IMAGE_TAG="$IMAGE:$CURRENT_TAG"
  }
  stages {
    stage('Checkout') {
        steps {
            sh 'ls -lah'
        }
    }
    stage('npm build') {
      steps {
        container('node') {
            sh '''
              npm -version
              npm install
            '''
        }
      }
    }
    stage('npm test') {
        steps {
            container('node') {
                sh '''
                  echo Test with email address $APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS
                  npm test
                '''
            }
        }
    }
    stage('Docker build & push') {
        steps {
            container('docker') {
                withDockerRegistry([ credentialsId: "docker", url: "" ]) {
                    sh '''
                      echo Creating IMAGE: ${IMAGE_TAG}
                      docker build -t ${IMAGE}:latest .
                      docker tag ${IMAGE}:latest ${IMAGE_TAG}
                      docker push ${IMAGE_TAG}
                      docker push ${IMAGE}:latest
                    '''
                }
            }
        }
    }
    stage('Tag & prepare deployment') {
        steps {
            container('node') {
                sh '''
                  echo Updating kubernetes config with image $IMAGE_TAG
                  perl -pi -e 's^( *image: *).*^$1$ENV{IMAGE_TAG}^g' $KUBERNETES_FILE
                  cat $KUBERNETES_FILE
                '''
            }
        }
    }
    stage('Deploy') {
        steps {
            container('kubectl') {
                sh '''
                  kubectl version
                  kubectl config view
                  kubectl config set-cluster mycluster --server=https://kubernetes
                  kubectl config set-credentials myuser --token $JENKINS_SERVICEACCOUNT
                  kubectl config set-context mycontext --user=myuser --cluster=mycluster
                  kubectl config use-context mycontext
                  kubectl config view
                  alias kubectl="kubectl --insecure-skip-tls-verify"
                  kubectl apply -f $KUBERNETES_FILE
                  kubectl wait --for=condition=available --timeout=600s deployment/statements
                '''
            }
        }
    }
  }
}