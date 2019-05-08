pipeline {
  agent {
    kubernetes {
      label 'jenkins-slave'
      defaultContainer 'jnlp'
      yamlFile 'k8s-jenkins-agent.yaml'
    }
  }
  environment {
      GOOGLE_APPLICATION_CREDENTIALS=credentials('google-serviceaccount')
      JENKINS_SERVICEACCOUNT=credentials('jenkins-serviceaccount')
      APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS='joseph@okharedia.com'
      IMAGE='ogatechnology/statements'
      KUBERNETES_FILE='k8s-statements.yaml'
      CURRENT_TAG = """${sh (script: 'date +%Y-%m-%d_%H-%M_$BUILD_NUMBER', returnStdout: true).trim()}"""
  }
  stages {
    stage('Checkout') {
        steps {
            git branch: 'master', credentialsId: 'github', url: 'https://github.com/ogatechnology/Statements.git'
            sh 'ls -lah'
        }
    }
    stage('Npm build') {
      steps {
        container('node') {
            sh 'npm -version'
            sh 'npm install'
        }
      }
    }
    stage('Npm test') {
        steps {
            container('node') {
                sh """echo Test with email address $APP_GOOGLE_AUTHORIZED_EMAIL_ADDRESS"""
                sh 'npm test'
            }
        }
    }
    stage('Docker build & push') {
        steps {
            container('docker') {
                withDockerRegistry([ credentialsId: "docker", url: "" ]) {
                    sh """
                      Creating IMAGE: ${IMAGE}:${CURRENT_TAG}
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
                  kubectl apply -f $KUBERNETES_FILE
                  kubectl wait --for=condition=available --timeout=600s deployment/statements
                """
            }
        }
    }
  }
}